<!DOCTYPE html>
<html ng-app = "contact">
<head>
 <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Page title set in pageTitle directive -->
 
    <!-- Bootstrap -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <!-- Fonts -->
    <link rel="stylesheet" href="font-awesome/css/font-awesome.min.css" >
    <!-- Main CSS files -->
    <link href="css/animate.css" rel="stylesheet">
    
     <link href="css/toastr.min.css" rel="stylesheet">
     <link href="css/ladda-themeless.min.css" rel="stylesheet"> 
     <link href="css/style.css" rel="stylesheet">

    <script src="js/jquery-2.1.1.min.js"></script>
    <script src="js/jquery-ui/jquery-ui.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/angular.min.js"></script>

    <script src="js/toastr.min.js"></script>
    
	<title>Contact List</title>

	<style type="text/css">
		.computed {
			display: none;
		}
	</style>
</head>
<body class="" landing-scrollspy id="page-top">
<toaster-container toaster-options="{'position-class':'toast-top-right','close-button':true,'body-output-type':'trustedHtml','showDuration':'200','hideDuration':'100'}">
</toaster-container>

<div id="wrapper" class="top-navigation">

<div class="row border-bottom white-bg">
    <nav class="navbar navbar-static-top" role="navigation">
        <div class="navbar-header">
            <button aria-controls="navbar" aria-expanded="false" data-target="#navbar" data-toggle="collapse" class="navbar-toggle collapsed" type="button">
                <i class="fa fa-reorder"></i>
            </button>
            <a href="{{url('/')}}" class="navbar-brand">Contact List App</a>
        </div>
        <div class="navbar-collapse collapse" id="navbar">
            <ul class="nav navbar-nav">

                 <li>
                    <a href = "{{url('/list')}}" > My Contacts </a>
                </li>

                 <li>
                    <a href = "{{url('/create')}}"  >New Contacts </a>
                </li>

            </ul>
     
        </div>
    </nav>
</div>


    <!-- Page wraper -->
    <!-- ng-class with current state name give you the ability to extended customization your view -->
    <div id="page-wrapper" class="gray-bg">
        <!-- Main view  -->
		@yield('content')
    </div>
    <!-- End page wrapper-->
</div>


<script type="text/javascript">
	$(document).ready(function(){
		$('.computed').css({'display':'block'});
	});
</script>





<script src="js/spin.min.js"></script>
<script src="js/ladda.min.js"></script>
<script src="js/angular-ladda.min.js"></script>
<script src="js/ui-bootstrap-tpls-1.1.2.min.js"></script>

<script src="js/angular-animate.min.js"></script>
<script src="js/angular-resource.min.js"></script>

<script src="ajaxy/app.js"></script>
</body>
</html>