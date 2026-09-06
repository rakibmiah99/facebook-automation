<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    {{-- 100 900 declares the face as covering that whole weight range — required for
         'Template Render Font' (a variable font) and harmless for the static Sorolota faces,
         which then just match any requested weight instead of only an exact one. --}}
    @foreach($fontDataUris as $fontFamilyName => $fontDataUri)
    @font-face {
        font-family: '{{ $fontFamilyName }}';
        src: url('{{ $fontDataUri }}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
    }
    @endforeach

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body {
        width: {{ $model['width'] }}px;
        height: {{ $model['height'] }}px;
    }

    #template-root {
        position: relative;
        width: {{ $model['width'] }}px;
        height: {{ $model['height'] }}px;
        overflow: hidden;
        font-family: {{ $model['fontFamily'] }};
        @if($model['background']['type'] === 'color')
        background: {{ $model['background']['color'] }};
        @else
        background: #e5e7eb;
        @endif
    }

    #template-background {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
</head>
<body>
<div id="template-root">
    @if($model['background']['type'] === 'image' && $model['background']['url'])
        <img id="template-background" src="{{ $model['background']['url'] }}" alt="">
    @endif

    @foreach($model['fields'] as $field)
        {{-- parentCss is null when the field has no parent_style — a plain, unstyled wrapper
             with zero layout effect, so existing configs render pixel-identical to before. --}}
        <div @if($field['parentCss']) style="{{ $field['parentCss'] }}" @endif>
            @if($field['type'] === 'image')
                <div style="{{ $field['css'] }}">
                    @if($field['src'])
                        <img src="{{ $field['src'] }}" alt="" style="width: 100%; height: 100%; object-fit: {{ $field['objectFit'] }};">
                    @endif
                </div>
            @else
                <div style="{{ $field['css'] }}">{{ $field['text'] }}</div>
            @endif
        </div>
    @endforeach
</div>
</body>
</html>
