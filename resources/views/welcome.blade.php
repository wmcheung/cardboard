<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">

        <title>WoningVR</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">
        <link href="{{ url('css/app.css') }}" rel="stylesheet" type="text/css">
    </head>
    <body>

        <div id="left_hud">
            <div id="guide_circle_left"></div>
            <div id="bottom_hud_text_area"><p class="info_text"></p></div>
        </div>

        <div id="right_hud">
            <div id="guide_circle_right"></div>
            <div id="bottom_hud_text_area"><p class="info_text"></p></div>
        </div>

        <div id="scene"><button id="goFS">Go fullscreen</button></div>
        <div id="selection_confirmation_overlay"></div>

        {{--<script src="{{ url('js/plugins.js') }}"></script>--}}
        <script src="{{ url('js/app.js') }}"></script>
    </body>
</html>
