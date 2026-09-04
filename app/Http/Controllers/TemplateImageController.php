<?php

namespace App\Http\Controllers;

use App\Http\Requests\TemplateImageGenerateRequest;
use App\Models\Template;
use App\Services\TemplateImageGenerationService;
use Illuminate\Http\Request;

class TemplateImageController extends Controller
{
    public function __construct(
        private TemplateImageGenerationService $templateImageGenerationService,
    ) {
    }

    public function index(Request $request)
    {
        $templates = $this->templateImageGenerationService->listAvailable($request->user()->id);

        return response()->json([
            'status' => true,
            'message' => 'Templates retrieved successfully.',
            'data' => $templates,
        ]);
    }

    public function show(Template $template)
    {
        $result = $this->templateImageGenerationService->describe($template);

        return response()->json([
            'status' => true,
            'message' => 'Template retrieved successfully.',
            'data' => $result,
        ]);
    }

    public function generate(TemplateImageGenerateRequest $request, Template $template)
    {
        $result = $this->templateImageGenerationService->generate(
            $template,
            $request->validated('values', []),
            $request->validated('page_id'),
            $request->validated('caption'),
            $request->validated('comment_message'),
        );

        return response()->json([
            'status' => true,
            'message' => 'Template image generated successfully.',
            'data' => $result,
        ]);
    }
}
