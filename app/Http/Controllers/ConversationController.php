<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConversationMessageStoreRequest;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\FacebookApp;
use App\Models\FacebookAppAccount;
use App\Services\ConversationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ConversationController extends Controller
{
    public function __construct(
        private ConversationService $conversationService,
    ) {
    }

    public function index(Request $request): Response
    {
        $app = $request->filled('facebook_app_id') ? FacebookApp::find($request->integer('facebook_app_id')) : null;
        $account = $request->filled('facebook_app_account_id') ? FacebookAppAccount::find($request->integer('facebook_app_account_id')) : null;
        $conversation = $request->filled('conversation') ? Conversation::find($request->integer('conversation')) : null;

        $data = $this->conversationService->index($app, $account, $conversation);

        return Inertia::render('conversations/pages/index', [
            'data' => $data,
        ]);
    }

    public function syncConversations(FacebookAppAccount $facebookAppAccount): RedirectResponse
    {
        try {
            $summary = $this->conversationService->syncConversations($facebookAppAccount);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', "Synced {$summary['total']} conversation(s) — {$summary['created']} new, {$summary['updated']} updated.");
    }

    public function syncMessages(Conversation $conversation): RedirectResponse
    {
        try {
            $summary = $this->conversationService->syncMessages($conversation);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', "Synced {$summary['total']} message(s) — {$summary['created']} new, {$summary['updated']} updated.");
    }

    public function storeMessage(ConversationMessageStoreRequest $request, Conversation $conversation): RedirectResponse
    {
        try {
            $this->conversationService->sendMessage($conversation, $request->validated('message'), $request->file('attachment'));
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Message sent successfully.');
    }

    public function retryMessage(ConversationMessage $conversationMessage): RedirectResponse
    {
        try {
            $this->conversationService->retryMessage($conversationMessage);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Message sent successfully.');
    }
}
