<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Folds comment_replies into post_comments via a self-referencing parent_comment_id,
     * since a reply is just a comment on another comment. This also fixes replies being
     * duplicated: previously a sent reply was stored in comment_replies, then re-synced
     * from Facebook's flat "stream" comment list into post_comments as a second, unrelated
     * top-level row for the same Facebook comment.
     */
    public function up(): void
    {
        Schema::table('post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_comment_id')->nullable()->default(null)->after('post_id');
            $table->boolean('is_automatic')->default(false)->after('commented_at');
            $table->foreign('parent_comment_id')->references('id')->on('post_comments')->onDelete('cascade');
        });

        foreach (DB::table('comment_replies')->get() as $reply) {
            $parent = DB::table('post_comments')->find($reply->post_comment_id);

            if (! $parent) {
                continue;
            }

            $duplicate = $reply->reply_id
                ? DB::table('post_comments')
                    ->where('post_id', $parent->post_id)
                    ->where('comment_id', $reply->reply_id)
                    ->first()
                : null;

            if ($duplicate) {
                DB::table('post_comments')->where('id', $duplicate->id)->update([
                    'parent_comment_id' => $reply->post_comment_id,
                    'is_automatic' => $reply->is_automatic,
                ]);

                continue;
            }

            DB::table('post_comments')->insert([
                'post_id' => $parent->post_id,
                'parent_comment_id' => $reply->post_comment_id,
                'comment_id' => $reply->reply_id,
                'message' => $reply->message,
                'is_automatic' => $reply->is_automatic,
                'created_at' => $reply->created_at,
                'updated_at' => $reply->updated_at,
            ]);
        }

        Schema::dropIfExists('comment_replies');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('comment_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_comment_id');
            $table->string('reply_id')->nullable()->default(null);
            $table->text('message');
            $table->boolean('is_automatic')->default(false);
            $table->timestamps();
            $table->foreign('post_comment_id')->references('id')->on('post_comments')->onDelete('cascade');
        });

        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_comment_id']);
            $table->dropColumn(['parent_comment_id', 'is_automatic']);
        });
    }
};
