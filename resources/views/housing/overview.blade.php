<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">

    <title>WoningVR - Woning dashboard</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <!-- Optional theme -->
    {{--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">--}}

    <style>
        .container-dashboard {
            margin: 40px auto;
        }
    </style>
</head>

<body>
    <div class="container container-dashboard">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">Woning - Dashboard</a>
                </div>
            </div><!-- /.container-fluid -->
        </nav>

        <div class="row">
            <div class="col-md-12"><h1>Woning informatie</h1><hr></div>
        </div>
        @foreach($housing_info as $info)
            @foreach($info->toArray() as $key=> $value)
            <div class="row">
                <div class="col-md-4">
                    {{ $key }}
                </div>
                <div class="col-md-8">
                    {!!  nl2br($value) !!}
                </div>
            </div>
            @endforeach
        @endforeach


        <div class="row">
            <div class="col-md-12"><h1>Statistieken</h1><hr></div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="alert alert-info">
                    <p>
                        Gemiddelde vraagprijs voor koopwoningen in <strong>Rotterdam</strong> op &euro; 261.179 staan? Dat is een verschil van <strong>&euro; 73.821</strong> met uw huidige vraagprijs.
                        <br><br>
                        Uit onze analyse bevat uw woning vooral de kleur wit en bruin. 20% van de woningen in <strong>Rotterdam</strong> worden sneller verkocht als de woning een lichtbruine kleur bevat.
                        <br><br>

                        <strong>Advies:</strong> op basis van de woningprijzen binnen de straal van 5km van de woning <strong>Laan van Avant-Garde 380</strong>, raden wij aan om de prijs te verlagen met <strong>&euro; 28.225</strong> om
                        meer kans te maken op snellere verkoop van uw woning.
                    </p>
                </div>
                <img class="img-responsive" src="https://image.prntscr.com/image/RxLAgJsYRKKCbT6jYRSWaQ.png"/>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12"><h1>WoningVR opzet</h1><hr></div>
            <div class="col-md-12">
                <div class="alert alert-info">
                    <p>De afbeeldingen hier zijn niet klikbaar, het is er om duidelijk te maken welke afbeelding bij welke scene hoort.</p>
                </div>
            </div>
        </div>

        <div class="row">
            @for($i = 1; $i <= $vr_images; $i++)
                <div class="col-md-4" style="margin-bottom: 50px;">
                    <div class="col-md-12">
                        <img class="img-responsive" src="/images/room_{{ $i }}.jpg"/>
                        <br>
                        Scene #{{ $i }}
                    </div>
                </div>
            @endfor
        </div>

        <div class="row">
            <div class="col-md-12">
                <h1>Bezoekers</h1>
                <a target="_blank" href="{{ url('/?show_heatmap=true&user=all') }}" class="btn btn-primary">Bekijk heatmap van alle bezoekers</a>
                <hr>
            </div>
        </div>

        <div class="row">
            @for($i = 1; $i <= $data_users; $i++)
                <div class="col-md-4" style="margin-bottom: 50px;">
                    <a target="_blank" href="{{ url('/?show_heatmap=true&user='.$i) }}"><img class="img-responsive" src="https://image.prntscr.com/image/Z3N1pCZKTDG1yNZdSX1Fig.png"/></a>
                    <hr>
                    <div class="row">
                        <div class="col-md-7">
                            <p>Bezoeker #{{ $i }}</p>
                        </div>
                        <div class="col-md-5">
                            <a target="_blank" href="{{ url('/?show_heatmap=true&user='.$i) }}" class="btn btn-primary">Bekijk heatmap</a>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="col-md-12">
                            <strong>Aantal seconden gebleven in een ruimte</strong>
                            <table class="table table-striped">
                                <thead>
                                <tr>
                                    <th>Ruimte #</th>
                                    <th>Seconden</th>
                                    <th>Laatst bekeken op</th>
                                </tr>
                                </thead>
                                <tbody>
                                @foreach($heatmap_times as $time)
                                    @if($time->user_number == $i)
                                    <tr>
                                        <th scope="row">{{ $time->scene_number }}</th>
                                        <td>{{ $time->time }} seconden</td>
                                        <td>{{ $time->updated_at }}</td>
                                    </tr>
                                    @endif
                                @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            @endfor
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
</body>

</html>