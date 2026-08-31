<?php

namespace App\Services;

use App\Helpers\UtilsHelper;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Repositories\FacebookRepositoryInterface;
use App\Repositories\MediaHelperRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class ConversationService
{
    public function __construct(
        private FacebookRepositoryInterface $facebookRepository,
        private MediaHelperRepositoryInterface $mediaHelper,
    ) {
    }

    /**
     * Resolve everything the two-pane inbox page needs in one shot: the user's connected
     * Facebook accounts (apps), the selected one's Pages, the selected Page's conversations,
     * and the selected conversation's messages.
     */
    public function index(?FacebookApp $app, ?FacebookAppAccount $account, ?Conversation $conversation): array
    {
        $apps = FacebookApp::query()->where('user_id', Auth::id())->latest()->get();

        if ($app) {
            abort_unless($app->user_id === Auth::id(), 403);
        }

        $selectedApp = $app ?? $apps->first();
        $pages = $selectedApp ? $selectedApp->accounts()->orderBy('account_name')->get() : collect();

        if ($account) {
            abort_unless($selectedApp && $account->facebook_app_id === $selectedApp->id, 403);
        }

        $selectedAccount = $account;
        $conversations = $selectedAccount
            ? $selectedAccount->conversations()->orderByDesc('conversation_updated_at')->get()
            : collect();

        if ($conversation) {
            abort_unless($selectedAccount && $conversation->facebook_app_account_id === $selectedAccount->id, 403);
        }

        $selectedConversation = $conversation;
        $messages = $selectedConversation ? $selectedConversation->messages()->get() : collect();

        return [
            'apps' => $apps,
            'selectedApp' => $selectedApp,
            'pages' => $pages,
            'selectedAccount' => $selectedAccount,
            'conversations' => $conversations,
            'selectedConversation' => $selectedConversation,
            'messages' => $messages,
        ];
    }

    /**
     * Pull a Page's Messenger conversation list (and metadata) from Facebook into the
     * local database.
     *
     * @return array{total: int, created: int, updated: int}
     */
    public function syncConversations(FacebookAppAccount $account): array
    {
        abort_unless($account->user_id === Auth::id(), 403);

        $facebookConversations = $this->facebookRepository->getPageConversations($account->access_token, $account->account_id);

        $summary = ['total' => 0, 'created' => 0, 'updated' => 0];

        foreach ($facebookConversations as $facebookConversation) {
            $result = $this->syncSingleConversation($account, $facebookConversation);

            if (! $result) {
                continue;
            }

            $summary['total']++;
            $summary[$result]++;
        }

        return $summary;
    }

    private function syncSingleConversation(FacebookAppAccount $account, array $facebookConversation): ?string
    {
        $facebookConversationId = $facebookConversation['id'] ?? null;

        if (! $facebookConversationId) {
            return null;
        }

        $conversation = Conversation::query()
            ->where('facebook_app_account_id', $account->id)
            ->where('conversation_id', $facebookConversationId)
            ->first();

        $isNew = ! $conversation;

        if (! $conversation) {
            $conversation = new Conversation([
                'facebook_app_account_id' => $account->id,
                'conversation_id' => $facebookConversationId,
            ]);
        }

        $participant = collect($facebookConversation['participants']['data'] ?? [])
            ->first(fn ($participant) => ($participant['id'] ?? null) !== $account->account_id);

        $conversation->fill([
            'participant_id' => $participant['id'] ?? null,
            'participant_name' => $participant['name'] ?? null,
            'participant_email' => $participant['email'] ?? null,
            'snippet' => $facebookConversation['snippet'] ?? null,
            'unread_count' => $facebookConversation['unread_count'] ?? 0,
            'message_count' => $facebookConversation['message_count'] ?? null,
            'link' => $facebookConversation['link'] ?? null,
            'conversation_updated_at' => $this->parseFacebookDate($facebookConversation['updated_time'] ?? null),
        ]);

        $conversation->save();

        return $isNew ? 'created' : 'updated';
    }

    /**
     * Pull a conversation's full message history from Facebook into the local database.
     *
     * @return array{total: int, created: int, updated: int}
     */
    public function syncMessages(Conversation $conversation): array
    {
        $conversation->loadMissing('facebookAppAccount');
        $account = $conversation->facebookAppAccount;

        abort_unless($account && $account->user_id === Auth::id(), 403);

        $facebookMessages = $this->facebookRepository->getConversationMessages($account->access_token, $conversation->conversation_id);

        $summary = ['total' => 0, 'created' => 0, 'updated' => 0];

        foreach ($facebookMessages as $facebookMessage) {
            $result = $this->syncSingleMessage($conversation, $account, $facebookMessage);

            if (! $result) {
                continue;
            }

            $summary['total']++;
            $summary[$result]++;
        }

        return $summary;
    }

    private function syncSingleMessage(Conversation $conversation, FacebookAppAccount $account, array $facebookMessage): ?string
    {
        $facebookMessageId = $facebookMessage['id'] ?? null;

        if (! $facebookMessageId) {
            return null;
        }

        $message = ConversationMessage::query()
            ->where('conversation_id', $conversation->id)
            ->where('message_id', $facebookMessageId)
            ->first();

        $isNew = ! $message;

        if (! $message) {
            $message = new ConversationMessage([
                'conversation_id' => $conversation->id,
                'message_id' => $facebookMessageId,
            ]);
        }

        $attachment = $facebookMessage['attachments']['data'][0] ?? null;

        $message->fill([
            'is_from_page' => ($facebookMessage['from']['id'] ?? null) === $account->account_id,
            'sender_id' => $facebookMessage['from']['id'] ?? null,
            'sender_name' => $facebookMessage['from']['name'] ?? null,
            'message' => $facebookMessage['message'] ?? null,
            'attachment_source_url' => $this->resolveAttachmentUrl($attachment),
            'attachment_type' => $attachment['mime_type'] ?? null,
            'sent_at' => $this->parseFacebookDate($facebookMessage['created_time'] ?? null),
        ]);

        $message->save();

        return $isNew ? 'created' : 'updated';
    }

    private function resolveAttachmentUrl(?array $attachment): ?string
    {
        if (! $attachment) {
            return null;
        }

        return $attachment['image_data']['url']
            ?? $attachment['video_data']['url']
            ?? $attachment['file_url']
            ?? null;
    }

    /**
     * Send a message from the Page to a conversation's participant. The local row is created
     * before the Graph call so a delivery failure stays visible and retryable instead of
     * silently lost — mirrors CommentReplyService::store.
     */
    public function sendMessage(Conversation $conversation, ?string $message, ?UploadedFile $attachment = null): ConversationMessage
    {
        $conversation->loadMissing('facebookAppAccount');
        $account = $conversation->facebookAppAccount;

        abort_unless($account && $account->user_id === Auth::id(), 403);

        if (! $conversation->participant_id) {
            throw new RuntimeException('This conversation has no known participant and cannot be messaged.');
        }

        $attachmentPath = null;
        $attachmentUrl = null;

        if ($attachment) {
            $path = UtilsHelper::MonthYearWisePath('conversations');
            $attachmentPath = $this->mediaHelper->upload($attachment, $path);
            $attachmentUrl = UtilsHelper::GetMediaUrl($attachmentPath);
        }

        $outgoing = ConversationMessage::create([
            'conversation_id' => $conversation->id,
            'is_from_page' => true,
            'sender_id' => $account->account_id,
            'sender_name' => $account->account_name,
            'message' => $message,
            'attachment_path' => $attachmentPath,
            'sent_at' => now(),
        ]);

        $this->deliver($conversation, $outgoing, $account, $message, $attachmentUrl);

        return $outgoing->refresh();
    }

    /**
     * Retry a message that previously failed to reach Facebook.
     */
    public function retryMessage(ConversationMessage $conversationMessage): ConversationMessage
    {
        $conversationMessage->loadMissing('conversation.facebookAppAccount');
        $conversation = $conversationMessage->conversation;
        $account = $conversation?->facebookAppAccount;

        abort_unless($account && $account->user_id === Auth::id(), 403);

        if ($conversationMessage->message_id) {
            throw new RuntimeException('Only failed messages can be retried.');
        }

        $attachmentUrl = $conversationMessage->attachment_path
            ? UtilsHelper::GetMediaUrl($conversationMessage->attachment_path)
            : null;

        $this->deliver($conversation, $conversationMessage, $account, $conversationMessage->message, $attachmentUrl);

        return $conversationMessage->refresh();
    }

    /**
     * Post a message to Facebook and record the outcome. Leaves message_id null (instead of
     * throwing) on failure, so the caller's row stays retryable — matches
     * CommentReplyService::sendReply's failure model.
     */
    private function deliver(Conversation $conversation, ConversationMessage $outgoing, FacebookAppAccount $account, ?string $message, ?string $attachmentUrl): void
    {
        try {
            $response = $this->facebookRepository->sendMessage(
                $account->access_token,
                $account->account_id,
                $conversation->participant_id,
                $message,
                $attachmentUrl,
            );

            $outgoing->update(['message_id' => $response['message_id'] ?? null]);
        } catch (RuntimeException) {
            // Already logged by FacebookHelper; leave message_id null to reflect the failure.
        }
    }

    private function parseFacebookDate(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return date('Y-m-d H:i:s', strtotime($value));
        } catch (\Throwable) {
            return null;
        }
    }
}
