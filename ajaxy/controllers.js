function dashboardCtrl(APP_URL,$scope, $http,toaster,EmployeeService) {

    $scope.cur_deduc = {};
    $scope.cur_payroll = {};
    $scope.pre_deduc = {};
    $scope.session = {};
    $scope.pre_payroll = {};
    $scope.sessions = {}; $scope.agent = {};
    $scope.cur_year = {}; $scope.pre_year={};
    $scope.cur_month = {}; $scope.pre_month={};

    $http.get( APP_URL + 'dashboard?api=api').then(function(res){
        $scope.sessions = res.data.sessions;
        $scope.agent = res.data.user_agent;
        if(!res.data.noData){
            $scope.cur_deduc =  res.data.cur_dec.cur_deduc;
            $scope.pre_deduc = res.data.pre_deduc.pre_deduc;
            $scope.cur_payroll = res.data.current_payroll;
            $scope.pre_payroll = res.data.previous_payroll;
            $scope.cur_month = res.data.current_month;
            $scope.pre_month = res.data.pre_month;
            $scope.pre_year = res.data.pre_year;
            $scope.cur_year = res.data.cur_year;
        }
    });

    $scope.logout = function(data){
        $scope.session.revoke = data;
        $http({
            method:"post",url: APP_URL + "revoke",
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            data:$.param($scope.session)
        }).then(function(res){
            if(res.data.success){
                EmployeeService.removeListItem($scope.sessions,data);
                toaster.success(res.data.success);
            }else{
                toaster.error(res.data.error);
            }
        });
    }

    $scope.deletePayroll = function(month,year){
        console.log(month);
        $http({
            method:"post",url: APP_URL + "payroll-delete",
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            data:$.param({year:year,month:month})
        }).then(function(res){
            console.log(res.data);
        });
    }

    $scope.approvePayroll = function(month,year){
        console.log(month);
        $http({
            method:"post",url: APP_URL + "approve-payroll",
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            data:$.param({year:year,month:month})
        }).then(function(res){
            console.log(res.data);
        });
    }

    var data1 = [
        [0,4],[1,8],[2,5],[3,10],[4,4],[5,16],[6,5],[7,11],[8,6],[9,11],[10,20],[11,10],[12,13],[13,4],[14,7],[15,8],[16,12]
    ];
    var data2 = [
        [0,0],[1,2],[2,7],[3,4],[4,11],[5,4],[6,2],[7,5],[8,11],[9,5],[10,4],[11,1],[12,5],[13,2],[14,5],[15,2],[16,0]
    ];

    var options = {
        series: {
            lines: {
                show: false,
                fill: true
            },
            splines: {
                show: true,
                tension: 0.4,
                lineWidth: 1,
                fill: 0.4
            },
            points: {
                radius: 0,
                show: true
            },
            shadowSize: 2
        },
        grid: {
            hoverable: true,
            clickable: true,
            borderWidth: 2,
            color: 'transparent'
        },
        colors: ["#1ab394", "#1C84C6"],
        xaxis:{
        },
        yaxis: {
        },
        tooltip: false
    };

    /**
     * Definition of variables
     * Flot chart
     */
    this.flotData = [data1, data2];
    this.flotOptions = options;


    var sparkline1Data = [34, 43, 43, 35, 44, 32, 44, 52];
    var sparkline1Options = {
        type: 'line',
        width: '100%',
        height: '50',
        lineColor: '#1ab394',
        fillColor: "transparent"
    };

    var sparkline2Data = [32, 11, 25, 37, 41, 32, 34, 42];
    var sparkline2Options = {
        type: 'line',
        width: '100%',
        height: '50',
        lineColor: '#1ab394',
        fillColor: "transparent"
    };

    this.sparkline1 = sparkline1Data;
    this.sparkline1Options = sparkline1Options;
    this.sparkline2 = sparkline2Data;
    this.sparkline2Options = sparkline2Options;

}

function MainCtrl() {
     this.PieChart = { data: [1, 4], options: { fill: ["#1ab394", "#d7d7d7"] } };
}

function paymentCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
	$scope.payments = {};
	$scope.payment = {};
	$scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

	$scope.isProcessing = false;
	$scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Payment Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.payments[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deletePayment(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Payment Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.payments[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deletePayment(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL + "payments")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"payments?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Payment";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Payment type";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL + 'payments-edit/'+id).then(function(res){$scope.payment = res.data; });
            break;
            default: break;
        } 
    }

	$scope.savePayment = function(modalstate, close, id) {	
		if(!$scope.PaymentForm.$invalid){
			if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
			$scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url = APP_URL+ "payments-edit/"+$scope.id; }else{ url = APP_URL + "payments-new"; }
			$http({
				method:"POST",url: url,
				data: $.param($scope.payment),
				headers: {'Content-Type':'application/x-www-form-urlencoded'}
			}).then(function(res){	
				$scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.PaymentForm.$setPristine(); $scope.PaymentForm.$setUntouched(); $scope.payment = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
			}, function(){  });
		}else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
	}

    $scope.deletePayment = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url: APP_URL + "payments-delete?trash=delete",
                    data:$.param({payment:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url: APP_URL + "payments-delete",
                    data:$.param({payment:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                }).error(function(data){ });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url: APP_URL + "payments-edit?restore=restore",
            data:$.param({payment:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){  });
    }

    $scope.close = function(){
        $scope.payment={}; $scope.errors = {};
        $scope.PaymentForm.$setPristine();
        $scope.PaymentForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function recurringpaymentCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.payments = {};
    $scope.payment = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Payment Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.payments[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deletePayment(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Payment Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.payments[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deletePayment(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL + "recurring-payments")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"recurring-payments?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Payment";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Recurring Payment type";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL + 'recurring-payments-edit/'+id).then(function(res){$scope.payment =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.savePayment = function(modalstate, close, id) {  
        if(!$scope.PaymentForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url = APP_URL + "recurring-payments-edit/"+$scope.id; }else{ url = APP_URL+"recurring-payments-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.payment),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.PaymentForm.$setPristine(); $scope.PaymentForm.$setUntouched(); $scope.payment = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){  });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deletePayment = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url: APP_URL + "recurring-payments-delete?trash=delete",
                    data:$.param({payment:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                }).error(function(data){  });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url: APP_URL+"recurring-payments-delete",
                    data:$.param({payment:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"recurring-payments-edit?restore=restore",
            data:$.param({payment:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){  });
    }

    $scope.close = function(){
        $scope.payment={}; $scope.errors = {};
        $scope.PaymentForm.$setPristine();
        $scope.PaymentForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function deductionCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.deductions = {};
    $scope.deduction = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Deduction Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.deductions[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deleteDeduction(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Deduction Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.deductions[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deleteDeduction(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+"deductions")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"deductions?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Deduction";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Recurring Deduction type";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL+'deductions-edit/'+id).then(function(res){$scope.deduction =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.saveDeduction = function(modalstate, close, id) {  
        if(!$scope.DeductionForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url = APP_URL+"deductions-edit/"+$scope.id; }else{ url = APP_URL+"deductions-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.deduction),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(data,status,headers,config){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.DeductionForm.$setPristine(); $scope.DeductionForm.$setUntouched(); $scope.deduction = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){  });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deleteDeduction = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url:APP_URL+"deductions-delete?trash=delete",
                    data:$.param({deduction:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url:APP_URL+"deductions-delete",
                    data:$.param({deduction:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"deductions-edit?restore=restore",
            data:$.param({deduction:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){  });
    }

    $scope.close = function(){
        $scope.Deduction={}; $scope.errors = {};
        $scope.DeductionForm.$setPristine();
        $scope.DeductionForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function recurringdeductionCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.deductions = {};
    $scope.deduction = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Deduction Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.deductions[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deleteDeduction(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Deduction Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.deductions[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deleteDeduction(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+"recurring-deductions")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"recurring-deductions?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Deduction";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Recurring Deduction type";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL+'recurring-deductions-edit/'+id).then(function(res){$scope.deduction =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.saveDeduction = function(modalstate, close, id) {  
        if(!$scope.DeductionForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url = APP_URL+"recurring-deductions-edit/"+$scope.id; }else{ url = APP_URL+"recurring-deductions-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.deduction),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.DeductionForm.$setPristine(); $scope.DeductionForm.$setUntouched(); $scope.deduction = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){ });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deleteDeduction = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url:APP_URL+"recurring-deductions-delete?trash=delete",
                    data:$.param({deduction:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url:APP_URL+"recurring-deductions-delete",
                    data:$.param({deduction:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"recurring-deductions-edit?restore=restore",
            data:$.param({deduction:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data,status,headers,config){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(data.success){ toaster.success(data.success); }else{ toaster.error(data.error); }
        },function(data){   });
    }

    $scope.close = function(){
        $scope.deduction={}; $scope.errors = {};
        $scope.DeductionForm.$setPristine();
        $scope.DeductionForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function departmentCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.departments = {};
    $scope.department = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Department Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.departments[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deleteDepartment(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Department Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.departments[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deleteDepartment(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+"departments")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"departments?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Department";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Department ";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL+'departments-edit/'+id).then(function(res){$scope.department =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.saveDepartment = function(modalstate, close, id) {  
        if(!$scope.DepartmentForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url =APP_URL+ "departments-edit/"+$scope.id; }else{ url = APP_URL+"departments-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.department),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.DepartmentForm.$setPristine(); $scope.DepartmentForm.$setUntouched(); $scope.department = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){ });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deleteDepartment = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url: APP_URL+"departments-delete?trash=delete",
                    data:$.param({department:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url: APP_URL+"departments-delete",
                    data:$.param({department:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"departments-edit?restore=restore",
            data:$.param({department:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){   });
    }

    $scope.close = function(){
        $scope.department={}; $scope.errors = {};
        $scope.DepartmentForm.$setPristine();
        $scope.DepartmentForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function locationCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.locations = {};
    $scope.location = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Location Name'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.locations[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deleteLocation(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Location Name'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.locations[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deleteLocation(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+"locations")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"locations?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Location";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Location";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL+'locations-edit/'+id).then(function(res){$scope.location =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.saveLocation = function(modalstate, close, id) {  
        if(!$scope.LocationForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url = APP_URL+"locations-edit/"+$scope.id; }else{ url = APP_URL+"locations-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.location),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.LocationForm.$setPristine(); $scope.LocationForm.$setUntouched(); $scope.location = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){ });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deleteLocation = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url:APP_URL+"locations-delete?trash=delete",
                    data:$.param({location:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url:APP_URL+"locations-delete",
                    data:$.param({location:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"locations-edit?restore=restore",
            data:$.param({location:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){ });
    }

    $scope.close = function(){
        $scope.location={}; $scope.errors = {};
        $scope.LocationForm.$setPristine();
        $scope.LocationForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function currencyCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal, toaster){
    $scope.currencies = {};
    $scope.currency = {};
    $scope.btnText = "Save";
    $scope.modalstate = ""; $scope.id="";
    $scope.btnText2 = "Save and Add Next";
    $scope.errors = {};

    $scope.isProcessing = false;
    $scope.btnClass = "btn-primary";
    $scope.btnClass2 = "btn-info";
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('Currency Name'),
        DTColumnBuilder.newColumn('rate').withTitle('Exchange Rate'),
        DTColumnBuilder.newColumn('created_at').withTitle('Date Created'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtml) ];
        function actionHtml(data,type,full,mata){
            $scope.currencies[data.id] = data;
            return "<a class = 'label label-sm label-warning' ng-click = 'deleteCurrency(" + data.id + ")'>Trash</a>  <a class = 'label label-sm label-primary' ng-click = 'toggle(" + '"edit",' + data.id + ")'>Edit</a>";
        }
    $scope.dtColumnsTrashed = [
        DTColumnBuilder.newColumn('name').withTitle('Currency Name'),
        DTColumnBuilder.newColumn('rate').withTitle('Exchange Rate'),
        DTColumnBuilder.newColumn('deleted_at').withTitle('Date Trashed'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionHtmlTrashed) ];
        function actionHtmlTrashed(data,type,full,mata){
            $scope.currencies[data.id] = data;
            return "<a class = 'label label-sm label-danger' ng-click = 'deleteCurrency(" + data.id + ", true)' >Delete</a>  <a class = 'label label-sm label-primary' ng-click = 'restore("+ data.id + ")'>Restore</a>";
        }

    $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+"currencies")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.dtOptionsTrashed = DTOptionsBuilder.fromSource(APP_URL+"currencies?trashed=yes")
        .withPaginationType("full_numbers").withOption('processing', true).withOption('deferRender', true)
        .withOption('autoWidth',false).withOption('bLengthChange', true)
        .withOption('fnRowCallback', function(nRow,aData,iDisplayIndex,iDisplayIndexFull){
            $compile(nRow)($scope)
        });

    $scope.nested = {};
    $scope.nested.dtInstance = {};
    $scope.nested.dtInstanceTrashed = {};

    $scope.toggle = function(modalstate, id) {
        $scope.modalstate = modalstate;
        $scope.showMe = true;   // This is used to hide the DIV that holds form
        switch(modalstate){     
            case "add":
            $scope.id = id;
            $scope.form_title = "New Currency";
            $('.formArea').animate({height: 'toggle'},200);
            break;
            case "edit":
            $scope.form_title = "Edit Currency";
            $('.formArea').show();
            $scope.id = id;
            $http.get(APP_URL+'currencies-edit/'+id).then(function(res){$scope.currency =  res.data; });
            break;
            default: break;
        } 
    }

    $scope.saveCurrency = function(modalstate, close, id) {  
        if(!$scope.CurrencyForm.$invalid){
            if (!close) {  
                $scope.btnText2 = "Saving........"; $scope.btnClass2 = "btn-warning";
            }else{
                $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
            }
            $scope.isProcessing = true;
            var url = null;
            if($scope.modalstate == "edit"){ url =APP_URL+ "currencies-edit/"+$scope.id; }else{ url = APP_URL+"currencies-new"; }
            $http({
                method:"POST",url: url,
                data: $.param($scope.currency),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){    
                $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary"; $scope.btnClass2 = "btn-info";
                $scope.btnText2 = "Save and Add Next"; $scope.nested.dtInstance.reloadData(); $scope.nested.dtInstanceTrashed.reloadData(); 
                $scope.CurrencyForm.$setPristine(); $scope.CurrencyForm.$setUntouched(); $scope.currency = {};
                if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};
                }else if(res.data.invalid){
                    $scope.errors = res.data.errors; return true;
                }        
                if(close == true){
                    $('.formArea').animate({height: 'toggle'},200);
                }
            },function(){ toaster.error('An has error occured please retry'); });
        }else{
            $scope.btnText = "Save";  $scope.btnText2 = "Save and Add Next"; $scope.btnClass2 = "btn-info"; $scope.btnClass = "btn-primary"; 
        $scope.isProcessing = false; return false;  }
    }

    $scope.deleteCurrency = function(id,t){      
        if(t){
            var isConfirmDelete = confirm("Record will be deleted permanently, Continue?")
           if(isConfirmDelete){
                $http({
                    method:"POST",url:APP_URL+"currencies-delete?trash=delete",
                    data:$.param({currency:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){  });
            }else {return true; } 
            return true;
        }
        var isConfirm = confirm("Are you sure you want this record deleted?")
            if(isConfirm){
                $http({
                    method:"POST",url:APP_URL+"currencies-delete",
                    data:$.param({currency:id}),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
                    if(res.data.success) { toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
                },function(data){ });
            }else {return true; }
        }

    $scope.restore = function(id){
        $http({
            method:"POST",url:APP_URL+"currencies-edit?restore=restore",
            data:$.param({currency:id}),
            headers: {'Content-Type':'application/x-www-form-urlencoded'}
        }).then(function(res){
            $scope.nested.dtInstance.reloadData();$scope.nested.dtInstanceTrashed.reloadData();
             if(res.data.success){ toaster.success(res.data.success); }else{ toaster.error(res.data.error); }
        },function(data){  });
    }

    $scope.close = function(){
        $scope.currency={}; $scope.errors = {};
        $scope.CurrencyForm.$setPristine();
        $scope.CurrencyForm.$setUntouched();
        $('.formArea').hide(200);
    }
}

function payrollsetupCtrl(APP_URL,$scope, $http,$compile,DTOptionsBuilder,DTColumnBuilder,$uibModal,toaster,bsLoadingOverlayService){
    $scope.config = {};
    $scope.months = {};
    $scope.errors = {};
    $scope.forms = {};
    $scope.error = false;
    $scope.pension = {};
    $scope.payslip = {};
    $scope.admin = {};

    $http.get(APP_URL+'get-payroll-setting').then(function(res){
        $scope.config = res.data; 
    });

    $http.get(APP_URL+'get-month-days').then(function(res){
        $scope.months = res.data; 
    });

    $http.get(APP_URL+'pension-distribution').then(function(res){
        $scope.pension = res.data; 
    });

    $http.get(APP_URL+'payroll-password').then(function(res){
        $scope.admin = res.data; 
    });

    $http.get(APP_URL+'payslip-template').then(function(res){
        $scope.payslip = res.data; 
    });

    $scope.loader = {
            //autoCheck: true,
            size: 32,  //指定菊花大小
            fontColor: '#000000',
            bgColor: '#FFFFFF',   //背景颜色
            bgOpacity: 0.7,    //背景透明度
            //fontColor: $('#fontColor').val(),  //文字颜色
            title: '<b>Saving.. Please wait</b>', //文字
            isOnly: false
    };

    $scope.savemonth = function(){
         if(!$scope.error){
            $('.loadableMonth').loader($scope.loader);
                $http({
                    method:"POST",url:APP_URL+"get-month-days",
                    data:$.param($scope.months),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    toaster.success(res.data); 
                    $.loader.close(true);
                },function(data){ toaster.error("An error occured please retry");
                    $.loader.close(true);
                 });
          }
    }

    $scope.savepension = function(){
        if(!$scope.forms.PensionForm.$invalid){
            $('.loadablePension').loader($scope.loader);
            $http({
                method:"POST",url:APP_URL+"pension-distribution",
                data:$.param($scope.pension),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                if(res.data.invalid){
                    $scope.errors = res.data.errors;
                    $scope.errors = {};
                }else{
                    toaster.success(res.data.success); 
                }
                $.loader.close(true);
            },function(data){ 
                $.loader.close(true);
            });
        }
    }

    $scope.savePayslip = function(){
        if(!$scope.forms.PayslipForm.$invalid){
            $('.loadablePayslip').loader($scope.loader);
            $http({
                method:"POST",url:APP_URL+"payslip-template",
                data:$.param($scope.payslip),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                if(res.data.invalid){
                    $scope.errors = res.data.errors;
                }else{
                    toaster.success(res.data.success); 
                    $scope.errors = {};
                }
                $.loader.close(true);
            },function(data){ 
                $.loader.close(true);
            });
        }  
    }

    $scope.savePayrollPassword = function(){
        if(!$scope.forms.AdminForm.$invalid){
            $('.loadableAdmin').loader($scope.loader);
            $http({
                method:"POST",url:APP_URL+"payroll-password",
                data:$.param($scope.admin),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                if(res.data.invalid){
                    $scope.errors = res.data.errors;
                }else{
                    toaster.success(res.data.success); 
                    $scope.errors = {};
                }
                $.loader.close(true);
            },function(data){ 
                $.loader.close(true);
            });
        }
    }

    $scope.change = function() { 
        var basic = $scope.config.basic?parseFloat($scope.config.basic):0;
        var transport = $scope.config.transport?parseFloat($scope.config.transport):0;
        var housing = $scope.config.housing?parseFloat($scope.config.housing):0;
        var leave = $scope.config.leave?parseFloat($scope.config.leave):0;
        var cop = $scope.config.cost_of_passage_allowance?parseFloat($scope.config.cost_of_passage_allowance):0; 
        var ent = $scope.config.entertainment?parseFloat($scope.config.entertainment):0;
        var edu = $scope.config.education_allowance?parseFloat($scope.config.education_allowance):0;
        var exp = $scope.config.expatriate_allowance?parseFloat($scope.config.expatriate_allowance):0; 
        var gratuity = $scope.config.gratuity?parseFloat($scope.config.gratuity).toFixed(2):0; 
        var loc = $scope.config.location_allowance?parseFloat($scope.config.location_allowance):0;
        var meal = $scope.config.meal?parseFloat($scope.config.meal):0; 
        var mort = $scope.config.mortgage_interest?parseFloat($scope.config.mortgage_interest):0; 
        var service = $scope.config.service_allowance?parseFloat($scope.config.service_allowance):0;
        var utility = $scope.config.utility?parseFloat($scope.config.utility):0;
        var life = $scope.config.life_assurance?parseFloat($scope.config.life_assurance):0;

        if((basic+transport+housing+leave+cop+ent+edu+exp+gratuity+loc+meal+mort+service+utility+life)>100){
            $('.notify').show();
            $scope.error=true;  
        }else{ $scope.error=false; $('.notify').hide();}
    }

    $scope.saveconfig = function(referenceId){
        if(!$scope.error){
            $('.loadable').loader($scope.loader);
            $http({
                method:"POST",url:APP_URL+"save-payroll-config",
                data:$.param($scope.config),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                toaster.success(res.data);
                $.loader.close(true);
            },function(data){
                $.loader.close(true);
             });
          }
    }
}

function reportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.forms = {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.selected ={}; $scope.SelectedArray={};
        $scope.selectAll = false; $scope.toggleAll = toggleAll; $scope.toggleOne = toggleOne; $scope.listAll ={};
        $scope.ladda1 =false; $scope.ladda2 =false; $scope.isProcessing=false
        $scope.availableOptions = [
                                    {id:'0',name:"Choose Action" },{ id:'1', name:"Send Payslips" },
                                    {id:'2',name:"Download Payslips" }];
        $scope.seletedOption = {id:'0',name:"Choose Action" };

        $http.get(APP_URL+'payroll-columns?e=e').then(function(res){  
            angular.forEach(res.data, function(value,key){
                $scope.selected[value.id] = value.id;
                $scope.listAll[value.id] = value.id;
            });
        });

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'payroll-columns?data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month = data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'payroll-columns?columns=columns').query().$promise;

        $scope.export = function(){
            if(!$scope.forms.PayrollForm.$invalid){
                 $scope.ladda2 = true; $scope.isProcessing = true;
                var month= $scope.payroll.month;
                var year = $scope.payroll.year;
                var ele = angular.element(document.querySelector('#excelExport'));
                $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                    if(res.data.success){
                        $window.location = ele.attr('sref');
                        $scope.ladda2 = false; $scope.isProcessing = false;
                    }else{
                        toaster.error(res.data.msg);
                        $scope.ladda2 = false; $scope.isProcessing = false;
                    }   
                });                
            }
        }

       $scope.filterPayroll = function(){
        
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.forms.PayrollForm.$invalid){
            $scope.ladda1 = true; $scope.isProcessing = true;
            $http.get(APP_URL+'payroll-columns?e=e').then(function(res){
                angular.forEach(res.data, function(value,key){
                    $scope.selected[value.id] = value.id;
                });
            });

           $scope.dtColumns = $resource(APP_URL+'payroll-columns?columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'payroll-columns?data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
       }

       function toggleAll(selectAll, selectedItems){
            for (var id in selectedItems) {
               if(selectedItems.hasOwnProperty(id)){
                    selectedItems[id] =selectAll;
                    if(selectedItems[id]==true){
                        $scope.SelectedArray[id]=id;
                    }else{
                        delete $scope.SelectedArray[id];
                    }
               }
            } 
       }

       function toggleOne(item){
           $scope.selectAll =false;
           if(!$scope.SelectedArray.hasOwnProperty(item)){
               $scope.SelectedArray[item]=item;
           }else{
                delete $scope.SelectedArray[item];
           }
           // Use to determine if all check box is selected when checking one by one
           // And automatically check the main check box --- IT was heal figuring this out
           var s=0;
           angular.forEach($scope.SelectedArray,function(value,key){
               if($scope.selected.hasOwnProperty(key)){ s++; } 
           });
           if(s === Object.keys($scope.selected).length){ $scope.selectAll = true; }
       }


        $scope.viewSlip = function (e_id,month,yr) { 
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/viewSlip/'+e_id+'/'+month+'/'+yr,
                size:'lg',
                backdrop:"static",keyboard:false,
                controller:slipCtrl
            });
        }

        $scope.download = function (e_id,month,yr){
           var url= APP_URL+"slip/"+e_id+'/'+month+'/'+yr;      
            SweetAlert.swal({ title: "Are you sure you want to download Payslip ?",
                        text: "payslip for selected employee will be downloaded",
                        type: "success",showCancelButton: true, confirmButtonColor: "#23c6c8",
                        confirmButtonText: "Yes, download it!", cancelButtonText: "No, cancel download!",
                        closeOnConfirm: false, closeOnCancel: false },
                    function (isConfirm) {
                        if (isConfirm) {     
                            SweetAlert.swal("Working on selected Payslip", "Please be patient download will begin shortly.", "success");           
                           /* $http.get(url).then(function(res){
                                console.log("i Gor here");
                                window.location.assign(res.data.url);
                            });  */   
                            window.location.assign(url); 
                        } else {
                            SweetAlert.swal("Cancelled", "Payslips download canceled", "error");
                        }
                    }); 
        }

        $scope.downloadAllSlips = function(e,m,y){
            var e = JSON.stringify(e); 
            var url= APP_URL+"slips/"+e+'/'+m+'/'+y;      
            SweetAlert.swal({ title: "Are you sure you want to download Payslips ?",
                        text: "Payslip for " + $scope.payroll.month+" "+$scope.payroll.year+" will be downloaded for all employees ",
                        type: "success",showCancelButton: true, confirmButtonColor: "#23c6c8",
                        confirmButtonText: "Yes, download it!", cancelButtonText: "No, cancel download!",
                        closeOnConfirm: false, closeOnCancel: false },
                    function (isConfirm) {
                        if (isConfirm) {     
                            SweetAlert.swal("Working on Payslips", "Please be patient download will begin shortly .", "success");           
                            $http.get(url).then(function(res){
                                $window.location = res.data.url;
                            });      
                        } else {
                            SweetAlert.swal("Cancelled", "Payslips download canceled", "error");
                        }
                    });
        }

         $scope.downloadAllSlipSelected = function(e,m,y){
            
            if(JSON.stringify(e)=="{}" || JSON.stringify($scope.SelectedArray)=="{}"){
                SweetAlert.swal({
                    title: "",
                    text: "Please select Employees and continue"
                });
            }else{
                var e = JSON.stringify(e);   
                var url = APP_URL+"slips/"+e+'/'+m+'/'+y;
               if($scope.seletedOption.id==2) // The User selected Download Slip
                {     
                    SweetAlert.swal({ title: "Are you sure you want to download Payslips ?",
                        text: "Only payslip for selected employees will be downloaded",
                        type: "success",showCancelButton: true, confirmButtonColor: "#23c6c8",
                        confirmButtonText: "Yes, download it!", cancelButtonText: "No, cancel download!",
                        closeOnConfirm: false, closeOnCancel: false },
                    function (isConfirm) {
                        if (isConfirm) {     
                            SweetAlert.swal("Working on Payslips", "You will be notified when download complete's.", "success");           
                            $http.get(url).then(function(res){
                                $window.location = res.data.url;
                            });      
                        } else {
                            SweetAlert.swal("Cancelled", "Payslips download canceled", "error");
                        }
                    });
               }else if($scope.seletedOption.id==1){

               }
            }     
             $scope.seletedOption = {id:'0',name:"Choose Action" };
        }
}


function pensionReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PensionForm = {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.ladda2 = false; $scope.ladda1 = false; $scope.isProcessing =false;

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'pension-report?data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'pension-report?columns=columns').query().$promise;
        
        $scope.export = function(){     
            if(!$scope.PensionForm.$invalid){
                $scope.ladda2 = true; $scope.isProcessing = true;
                var month= $scope.payroll.month;
                var year = $scope.payroll.year;
                var ele = angular.element(document.querySelector('#excelExport'));
                $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                    if(res.data.success){
                        $window.location = ele.attr('sref');
                        $scope.ladda2 = false; $scope.isProcessing = false;
                    }else{
                        toaster.error(res.data.msg);
                        $scope.ladda2 = false; $scope.isProcessing = false;
                    }   
                });                
            }
        }
      
    $scope.filterPayroll = function(){
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PensionForm.$invalid){  
            $scope.ladda1 = true; $scope.isProcessing = true;
           $scope.dtColumns = $resource(APP_URL+'pension-report?columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;

           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });

           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'pension-report?data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;                 
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
       }
}

function remmitanceReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PensionForm = {}; $scope.payroll = {}; $scope.ladda1 = false; $scope.ladda2 = false;  $scope.dtInstance ={}; $scope.isProcessing =false;

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'remmitance-report?data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'remmitance-report?columns=columns').query().$promise;

        
        $scope.export = function(){
            $scope.ladda2 = true; $scope.isProcessing = true;
            var month= $scope.payroll.month;
            var year = $scope.payroll.year;
            var ele = angular.element(document.querySelector('#excelExport'));
            $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                if(res.data.success){
                    $window.location = ele.attr('sref');
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }else{
                    toaster.error(res.data.msg);
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }   
            });                
        }
      
    $scope.filterPayroll = function(){
       
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PensionForm.$invalid){
           $scope.ladda1 = true; $scope.isProcessing = true;
           $scope.dtColumns = $resource(APP_URL+'remmitance-report?columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'remmitance-report?data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
       }
}

function taxReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PensionForm = {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.ladda1 = false; $scope.ladda2 = false; $scope.isProcessing=false

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'tax-report?data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'tax-report?columns=columns').query().$promise;

        
        $scope.export = function(){
            $scope.ladda2 = true; $scope.isProcessing = true; 
            var month= $scope.payroll.month;
            var year = $scope.payroll.year;
            var ele = angular.element(document.querySelector('#excelExport'));
            $http.get(APP_URL+'/payroll-exist?m='+month+'&y='+year).then(function(res){

                if(res.data.success){
                    $window.location = ele.attr('sref');
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }else{
                    toaster.error(res.data.msg);
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }   
            });                
        }
      
    $scope.filterPayroll = function(){
       
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PensionForm.$invalid){ 
         $scope.ladda1 = true; $scope.isProcessing = true; 
           $scope.dtColumns = $resource(APP_URL+'tax-report?columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
            $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'tax-report?data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
       }
}

function nsitfReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PensionForm = {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.isProcessing=false; $scope.ladda2=false; $scope.ladda1=false;

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'/nsitf-report?data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'nsitf-report?columns=columns').query().$promise;

        
        $scope.export = function(){
             $scope.ladda2 = true; $scope.isProcessing = true;
            var month= $scope.payroll.month;
            var year = $scope.payroll.year;
            var ele = angular.element(document.querySelector('#excelExport'));
            $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                if(res.data.success){
                    $window.location = ele.attr('sref');
                     $scope.ladda2 = false; $scope.isProcessing = false;
                }else{
                    toaster.error(res.data.msg);
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }   
            });                
        }
      
    $scope.filterPayroll = function(){
       
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PensionForm.$invalid){  
            $scope.ladda1 = true; $scope.isProcessing = true;
           $scope.dtColumns = $resource(APP_URL+'nsitf-report?columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'nsitf-report?data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
       }
}


function DeptReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PayrollForm= {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.isProcessing=false; $scope.ladda2=false; $scope.ladda1=false;

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'report-fields?t=dept&data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'payroll-columns?t=dept&dt=dt&f=fields&columns=columns').query().$promise;

        $scope.export = function(){
            $scope.ladda2 = true; $scope.isProcessing = true;
            var month= $scope.payroll.month;
            var year = $scope.payroll.year;
            var ele = angular.element(document.querySelector('#excelExport'));
            $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                if(res.data.success){
                    $window.location = ele.attr('sref');
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }else{
                    toaster.error(res.data.msg);
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }   
            });                
        }
      
    $scope.filterPayroll = function(){
        
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PayrollForm.$invalid){   
        $scope.ladda1 = true; $scope.isProcessing = true;     
           $scope.dtColumns = $resource(APP_URL+'payroll-columns?t=dept&dt=dt&f=fields&columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'report-fields?t=dept&data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
    }
}

function LocReportCtrl(APP_URL,$scope,$http,$compile,$resource,$q,DTColumnBuilder,DTColumnDefBuilder,DTOptionsBuilder,$uibModal,toaster,$window,SweetAlert,$sce){
        $scope.PayrollForm= {}; $scope.payroll = {}; $scope.dtInstance ={}; $scope.isProcessing=false; $scope.ladda2=false; $scope.ladda1=false;

        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'report-fields?t=loc&data=data')
        .withOption('createdRow', function(row, data,dataIndex){
            //Assign Initial Month and Year based on employees last generated payslip if any
            data.month ? $scope.payroll.month =  data.month: null;
            data.year ? $scope.payroll.year = data.year: null;
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    $compile(angular.element(header).contents())($scope);
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        $scope.dtColumns = $resource(APP_URL+'payroll-columns?t=loc&dt=dt&f=fields&columns=columns').query().$promise;

        $scope.export = function(){
            $scope.ladda2 = true; $scope.isProcessing = true;
            var month= $scope.payroll.month;
            var year = $scope.payroll.year;
            var ele = angular.element(document.querySelector('#excelExport'));
            $http.get(APP_URL+'payroll-exist?m='+month+'&y='+year).then(function(res){
                if(res.data.success){
                    $window.location = ele.attr('sref');
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }else{
                    toaster.error(res.data.msg);
                    $scope.ladda2 = false; $scope.isProcessing = false;
                }   
            });                
        }
      
    $scope.filterPayroll = function(){
        
        $scope.selected={}; //$scope.dtInstance ={};
        if(!$scope.PayrollForm.$invalid){     
            $scope.ladda1 = true; $scope.isProcessing = true;   
           $scope.dtColumns = $resource(APP_URL+'payroll-columns?t=loc&dt=dt&f=fields&columns=columns&month='+$scope.payroll.month+'&year='+$scope.payroll.year).query().$promise;
           $scope.dtColumns.then(function(data){
                $scope.ladda1 = false; $scope.isProcessing = false;
           });
           $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'report-fields?t=loc&data=data&month='+$scope.payroll.month+'&year='+$scope.payroll.year)
        .withOption('createdRow', function(row, data,dataIndex){
            $compile(angular.element(row).contents())($scope); })
            .withOption('headerCallback', function(header){
                //Check if datatable header is already compiled if no compile it
                $compile(angular.element(header).contents())($scope);
                if(!$scope.headerCompiled){
                    $scope.headerCompiled =true;
                    
                }
        }).withPaginationType('full_numbers').withOption('processing', true).
            withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true).
            withDOM('<"html5buttons"B>lTfgitp')
            .withButtons([{extend: 'copy'}, {extend: 'csv','title':'ExampleFile'}, {extend: 'excel', title: 'ExampleFile'},
            {extend: 'print',
                customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]);
        }else{
            $scope.ladda1 = false; $scope.isProcessing = false;
        }
    }
}

function slipCtrl (APP_URL,$scope,$window){
    $scope.download = function(e,m,y){
        $window.location =APP_URL+"slip/"+e+'/'+m+'/'+y;
    }
}

function empModalCrtl(APP_URL,$scope,$http,toaster,$httpParamSerializerJQLike, employee,forms, payConfig,$uibModalInstance)
{
    $scope.isProcessing = false;
    $scope.ladda1 = false; $scope.ladda2 = false;
    $scope.readOnlyInput = true; 
    $scope.forms = forms;
    $scope.employee = employee;
    $scope.errors={};

    if($scope.employee.location_id != null ){
        $scope.employee.location_id = ""+employee.location_id+"";
        $scope.employee.department_id = ""+employee.department_id+"";
    }
    
    $scope.config = payConfig;

    $scope.computePay = function() {
        $scope.total=0;
        var basic = $scope.config.basic?parseFloat($scope.config.basic):0;
        var transport = $scope.config.transport?parseFloat($scope.config.transport):0;
        var housing = $scope.config.housing?parseFloat($scope.config.housing):0;
        var leave = $scope.config.leave?parseFloat($scope.config.leave):0;
        var cop = $scope.config.cost_of_passage_allowance?parseFloat($scope.config.cost_of_passage_allowance):0; 
        var ent = $scope.config.entertainment?parseFloat($scope.config.entertainment):0;
        var edu = $scope.config.education_allowance?parseFloat($scope.config.education_allowance):0;
        var exp = $scope.config.expatriate_allowance?parseFloat($scope.config.expatriate_allowance):0; 
        var gratuity = $scope.config.gratuity?parseFloat($scope.config.gratuity):0; 
        var loc = $scope.config.location_allowance?parseFloat($scope.config.location_allowance):0;
        var meal = $scope.config.meal?parseFloat($scope.config.meal):0; 
        var mort = $scope.config.mortgage_interest?parseFloat($scope.config.mortgage_interest):0; 
        var service = $scope.config.service_allowance?parseFloat($scope.config.service_allowance):0;
        var utility = $scope.config.utility?parseFloat($scope.config.utility):0;
        var life = $scope.config.life_assurance?parseFloat($scope.config.life_assurance):0;

        $scope.total = basic+transport+housing+leave+cop+ent+edu+exp+gratuity+loc+meal+mort+service+utility+life;

        $scope.employee.basic = $scope.config.basic?parseFloat(($scope.config.basic/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.transport = $scope.config.transport?parseFloat(($scope.config.transport/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.housing = $scope.config.housing?parseFloat(($scope.config.housing/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.leave = $scope.config.leave?parseFloat(($scope.config.leave/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.cost_of_passage_allowance = $scope.config.cost_of_passage_allowance?parseFloat(($scope.config.cost_of_passage_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.entertainment = $scope.config.entertainment?parseFloat(($scope.config.entertainment/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.education_allowance = $scope.config.education_allowance?parseFloat(($scope.config.education_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.expatriate_allowance = $scope.config.expatriate_allowance?parseFloat(($scope.config.expatriate_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.gratuity = $scope.config.gratuity?parseFloat(($scope.config.gratuity/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.location_allowance = $scope.config.location_allowance?parseFloat(($scope.config.location_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.meal = $scope.config.meal?parseFloat(($scope.config.meal/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.mortgage_interest = $scope.config.mortgage_interest?parseFloat(($scope.config.mortgage_interest/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.service_allowance = $scope.config.service_allowance?parseFloat(($scope.config.service_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.utility = $scope.config.utility?parseFloat(($scope.config.utility/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.life_assurance = $scope.config.life_assurance?parseFloat(($scope.config.life_assurance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
    }

    $scope.getPayrollConfig = function(){
        $scope.employee.cra = $scope.config.cra;
        $scope.employee.cost_of_passage_deduction = $scope.config.cost_of_passage_deduction;
        $scope.employee.leave_deduction=$scope.config.leave_deduction;
        $scope.employee.housing_deduction=$scope.config.housing_deduction;
        $scope.employee.nhf_deduction=$scope.config.nhf_deduction;
        $scope.employee.pension_deduction=$scope.config.pension_deduction;
        $scope.employee.fixed_cra=$scope.config.fixed_cra;
        $scope.employee.children=$scope.config.children;
        $scope.employee.disability=$scope.config.disability;
        $scope.employee.pension=$scope.config.pension;
        $scope.employee.dependable_relative=$scope.config.dependable_relative;
        $scope.employee.nhf=$scope.config.nhf;
    }

    $scope.saveEmployee = function(close){
        $scope.employee.employment_date = moment($scope.employee.employment_date).format('YYYY-MM-DD');
        $scope.employee.dob = moment($scope.employee.dob).format('YYYY-MM-DD');
        $scope.isProcessing = true;
        if(close==true){$scope.ladda1=true;} else { $scope.ladda2=true;}
        $http({
                method:"POST",url:APP_URL+"employee/save-employee?e=e",
                data:$httpParamSerializerJQLike($scope.employee),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                if(res.data.success){ 
                    $scope.employee={};
                    $scope.forms.employeeForm.$setPristine();
                    $scope.forms.employeeForm.$setUntouched();
                    toaster.success(res.data.success); $scope.errors = {};
                    $scope.isProcessing = $scope.ladda2 = $scope.ladda1 = false;
                    $scope.getPayrollConfig();
                    if(close ==true){ $uibModalInstance.close(); }
                }else if(res.data.invalid){
                    if($scope.employee.dob){
                        $scope.employee.dob = moment($scope.employee.dob,'yyyy-MM-DD');
                    }
                    if($scope.employee.employment_date){
                        $scope.employee.employment_date = moment($scope.employee.employment_date,'yyyy-MM-DD');
                    } 
                    $scope.isProcessing = $scope.ladda2 = $scope.ladda1 = false;$scope.isProcessing =false;
                    $scope.errors = res.data.errors;
                }  
            },function(data){ 
                $scope.isProcessing =false; toaster.error("An error occured please retry");
                $scope.ladda2 = $scope.ladda1 = false;$scope.isProcessing =false;
        });
    }

    $scope.closeModal = function(){
        $uibModalInstance.dismiss('cancel');
    }
}

/*function paystructureCtrl($scope,$http,oneoffDeductions,oneoffPayments){
    $scope.oneoffPayments=oneoffPayments;
    $scope.oneoffDeductions=oneoffDeductions;
} */

function employeeCtrl(APP_URL,$scope,$http,$compile,$q,DTOptionsBuilder,DTColumnBuilder,$uibModal,$resource,toaster,$httpParamSerializerJQLike,$filter,EmployeeService){
    $scope.dtInstance = {};
    $scope.isProcessing = false;
    $scope.forms ={};
    $scope.employee = {};
    $scope.errors={};
    $scope.employees = {};
    $scope.modalstate = {};
    $scope.config = {};
    $scope.payroll={};

    $scope.arrears ={}; $scope.absents={}; $scope.currencies={}; $scope.oneoffPayments={}; $scope.recurrentPayments={}; $scope.oneoffDeductions={}; $scope.recurringDeductions={}; $scope.workDays={};
    $scope.arrear ={}; $scope.absent={}; $scope.currency={}; $scope.oneoffPayment={}; $scope.recurrentPayment={}; $scope.oneoffDeduction={}; $scope.recurringDeduction={}; $scope.workDay ={};

    //Used to controll input readOnly Option when you want to use auto calculator i.e from payroll setup
    $scope.readOnlyInput = true; 

    $scope.getPayrollConfig = function(){
        $http.get(APP_URL,'get-payroll-setting').then(function(res){
            $scope.config = res.data; 
            $scope.employee.cra = res.data.cra;
            $scope.employee.cost_of_passage_deduction = res.data.cost_of_passage_deduction;
            $scope.employee.leave_deduction=res.data.leave_deduction;
            $scope.employee.housing_deduction=res.data.housing_deduction;
            $scope.employee.nhf_deduction=res.data.nhf_deduction;
            $scope.employee.pension_deduction=res.data.pension_deduction;
            $scope.employee.fixed_cra=res.data.fixed_cra;
            $scope.employee.children=res.data.children;
            $scope.employee.disability=res.data.disability;
            $scope.employee.pension=res.data.pension;
            $scope.employee.dependable_relative=res.data.dependable_relative;
            $scope.employee.nhf=res.data.nhf;
          // angular.copy(employee, $scope.original); 
        });
    }

    // Initialize the settings
    $scope.getPayrollConfig();

    $scope.employeeTable = function(){
        $scope.dtOptions = DTOptionsBuilder.fromSource(APP_URL+'elist?data=data')
            .withOption('createdRow', function(row, data,dataIndex){
                //Assign Initial Month and Year based on employees last generated payslip if any
                data.month ? $scope.payroll.month = data.month: null;
                data.year ? $scope.payroll.year = data.year: null;
                $compile(angular.element(row).contents())($scope); })
                .withOption('headerCallback', function(header){
                    //Check if datatable header is already compiled if no compile it
                    if(!$scope.headerCompiled){
                        $scope.headerCompiled =true;
                        $compile(angular.element(header).contents())($scope);
                    }
            }).withPaginationType('full_numbers').withOption('processing', true).
                withOption('deferRender', true).withOption('autoWidth',false).withOption('bLengthChange', true);
            $scope.dtColumns = $resource(APP_URL+'elist?columns=columns').query().$promise;
    }
    
    //Load Employee Table Data
    $scope.employeeTable();
    
    $scope.editEmpForm = function(id){
        $http.get(APP_URL+'employee/add/'+id).then(function(data){
            $scope.showEmployeeModal(data.data);
        }); 
    }

    $scope.EmpForm = function () {
        $scope.getPayrollConfig();
        $scope.showEmployeeModal();
    }

    $scope.showEmployeeModal = function(data){
        var modalInstance = $uibModal.open({
                templateUrl: APP_URL+'employee/add', 
                size:'lg',
                backdrop:"static",keyboard:true,
                scope:$scope, 
                controller:empModalCrtl,   
                resolve:{
                forms: function(){
                    return $scope.forms;
                },
                employee: function(){
                    return data? data: $scope.employee;
                },
                payConfig: function(){
                    return $scope.config;
                }
               }         
            }).result.then(function(){
                $scope.dtInstance.reloadData();
        }, function(){
                 $scope.dtInstance.reloadData();
        }); 
    }

    $scope.EmployeePayStructure = function (emp) { 
        $scope.employee.id = emp;
        var workDays = $http.get(APP_URL+"employee/workdays/"+emp).then(function(data){ $scope.workDays = data.data; return data.data;  });
        var arrears = $http.get(APP_URL+"employee/arrears/"+emp).then(function(data){ $scope.arrears = data.data; return data.data;});
        var currencies = $http.get(APP_URL+"employee/currencies/"+emp).then(function(data){ $scope.currencies = data.data; return  data.data;});
        var absents = $http.get(APP_URL+"employee/absents/"+emp).then(function(data){ $scope.absents = data.data; return  data.data; });
        var oneoffPayments = $http.get(APP_URL+"employee/payments/"+emp).then(function(data){ $scope.oneoffPayments = data.data; return  data.data;   });
        var recurrentPayments = $http.get(APP_URL+"employee/payments/"+emp +"?recurring=rec").then(function(data){ $scope.recurrentPayments =data.data; return data.data; });
        var oneoffDeductions = $http.get(APP_URL+"employee/deductions/"+emp).then(function(data){ $scope.oneoffDeductions = data.data; return  data.data; });
        var recurringDeductions = $http.get(APP_URL+"employee/deductions/"+emp+"?recurring=rec").then(function(data){ $scope.recurringDeductions = data.data; return  data.data; });      

        $q.all([workDays,arrears,currencies,absents,oneoffDeductions,oneoffPayments,recurringDeductions,recurrentPayments]).then(function(result){
                var modalInstance = $uibModal.open({
                templateUrl: APP_URL+'employee/pay-element', 
                size:'lg',
                backdrop:"static",keyboard:true,
                scope: $scope,
                controller: payElementCtrl,
                resolve: {
                    forms: function(){ return $scope.forms; },
                    employee: function(){ return $scope.employee; },
                    workdays: function(){  return workDays; },
                    arrears: function() { return arrears; },
                    currencies: function(){ return currencies; },
                    absents: function() { return absents; },
                    oneoffPayments: function() { return oneoffPayments; },
                    recurrentPayments: function() { return recurrentPayments; },
                    oneoffDeductions: function(){ return oneoffDeductions; },
                    recurringDeductions: function(){ return recurringDeductions; }
                }
            }).result.then(function(){ }, function(){ });
        });
    }

    $scope.runPayroll = function(){
        $scope.isProcessing = false
        if(!$scope.forms.PayrollForm.$invalid){
            $scope.isProcessing = true;
            $http({
                    method:"POST",url:APP_URL+"run-payroll",
                    data:$.param($scope.payroll),
                    headers: {'Content-Type':'application/x-www-form-urlencoded'}
                }).then(function(res){
                    if(res.data.error){
                        toaster.error(res.data.msg);
                    }else { toaster.success(res.data.msg); }
                    $scope.payroll={};
                    $scope.forms.PayrollForm.$setPristine();
                    $scope.forms.PayrollForm.$setUntouched();
                    $scope.isProcessing = false;
                }, function(data){ $scope.isProcessing = false;
            });
        }
    }

    $scope.computePay = function() {
        $scope.total=0;
        var basic = $scope.config.basic?parseFloat($scope.config.basic):0;
        var transport = $scope.config.transport?parseFloat($scope.config.transport):0;
        var housing = $scope.config.housing?parseFloat($scope.config.housing):0;
        var leave = $scope.config.leave?parseFloat($scope.config.leave):0;
        var cop = $scope.config.cost_of_passage_allowance?parseFloat($scope.config.cost_of_passage_allowance):0; 
        var ent = $scope.config.entertainment?parseFloat($scope.config.entertainment):0;
        var edu = $scope.config.education_allowance?parseFloat($scope.config.education_allowance):0;
        var exp = $scope.config.expatriate_allowance?parseFloat($scope.config.expatriate_allowance):0; 
        var gratuity = $scope.config.gratuity?parseFloat($scope.config.gratuity):0; 
        var loc = $scope.config.location_allowance?parseFloat($scope.config.location_allowance):0;
        var meal = $scope.config.meal?parseFloat($scope.config.meal):0; 
        var mort = $scope.config.mortgage_interest?parseFloat($scope.config.mortgage_interest):0; 
        var service = $scope.config.service_allowance?parseFloat($scope.config.service_allowance):0;
        var utility = $scope.config.utility?parseFloat($scope.config.utility):0;
        var life = $scope.config.life_assurance?parseFloat($scope.config.life_assurance):0;

        $scope.total = basic+transport+housing+leave+cop+ent+edu+exp+gratuity+loc+meal+mort+service+utility+life;

        $scope.employee.basic = $scope.config.basic?parseFloat(($scope.config.basic/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.transport = $scope.config.transport?parseFloat(($scope.config.transport/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.housing = $scope.config.housing?parseFloat(($scope.config.housing/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.leave = $scope.config.leave?parseFloat(($scope.config.leave/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.cost_of_passage_allowance = $scope.config.cost_of_passage_allowance?parseFloat(($scope.config.cost_of_passage_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.entertainment = $scope.config.entertainment?parseFloat(($scope.config.entertainment/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.education_allowance = $scope.config.education_allowance?parseFloat(($scope.config.education_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.expatriate_allowance = $scope.config.expatriate_allowance?parseFloat(($scope.config.expatriate_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.gratuity = $scope.config.gratuity?parseFloat(($scope.config.gratuity/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.location_allowance = $scope.config.location_allowance?parseFloat(($scope.config.location_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.meal = $scope.config.meal?parseFloat(($scope.config.meal/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.mortgage_interest = $scope.config.mortgage_interest?parseFloat(($scope.config.mortgage_interest/$scope.total)*$scope.employee.lumpsum).toFixed(2):null; 
        $scope.employee.service_allowance = $scope.config.service_allowance?parseFloat(($scope.config.service_allowance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.utility = $scope.config.utility?parseFloat(($scope.config.utility/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
        $scope.employee.life_assurance = $scope.config.life_assurance?parseFloat(($scope.config.life_assurance/$scope.total)*$scope.employee.lumpsum).toFixed(2):null;
    }
}

function payElementCtrl(APP_URL,$scope,$http,$q,$resource,toaster,$uibModalInstance,EmployeeService,employee,forms,workdays,arrears,currencies,absents,oneoffDeductions,oneoffPayments,recurringDeductions,recurrentPayments){
    $scope.isProcessing = false;$scope.errors={};
    $scope.modalstate = {};
    $scope.employee = employee; $scope.forms= forms; $scope.workDays=workdays; $scope.arrears=arrears; $scope.currencies=currencies;
    $scope.absents=absents; $scope.oneoffDeductions=oneoffDeductions; $scope.oneoffPayments=oneoffPayments;
    $scope.recurringDeductions=recurringDeductions; $scope.recurrentPayments=recurrentPayments;

    $scope.closeModal = function(){
        $uibModalInstance.dismiss('cancel');
    }

    var AfterHttp = function(res,model,form){
        $scope.btnText = "Save"; $scope.isProcessing = false; $scope.btnClass = "btn-primary";
        form.$setPristine(); form.$setUntouched(); 
        if(res.data.success){ toaster.success(res.data.success); $scope.errors = {};      
        $scope.modalstate.model = "add"; 
        }else if(res.data.invalid){
            $scope.errors = res.data.errors; return true;
        }else{
            toaster.error(res.data.msg);
        }   
    }

    var BeforeHttp = function(){
        $scope.btnText = "Saving........"; $scope.btnClass = "btn-warning"; 
        $scope.isProcessing = true;
    }

    $scope.saveArrear = function() {    
        if(!$scope.forms.ArrearForm.$invalid){
            BeforeHttp();
            var url =  $scope.modalstate.arrear != "add" ? APP_URL +'employee/arrear-add/'+$scope.employee.id+'?e=edit' : APP_URL + 'employee/arrear-add';
            var p =  EmployeeService.save($scope.arrear,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.arrear,$scope.forms.ArrearForm); 
                if($scope.modalstate.arrear == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.arrears,$scope.arrear.id); }
                if(!res.data.msg) { $scope.arrear = {}; EmployeeService.refreshList($scope.arrears, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editArrear = function(id){
        $http.get(APP_URL+'employee/arrear-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.arrear =  data.data; 
        $scope.modalstate.arrear="edit";
        });
    }

    $scope.deleteArrear = function(id,emp_id){          
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("arrear",data,APP_URL+"employee/arrear-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.arrears,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){  });
        }                
    }
   
    $scope.resetForm =function(form){
        $scope.modalstate.form="add";
        $scope.forms.ArrearForm.$setPristine(); $scope.forms.ArrearForm.$setUntouched(); 
        $scope.arrear = {};
    }

    $scope.saveAbsent = function() {  
        if(!$scope.forms.AbsentForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.absent === "edit" ? APP_URL+ 'employee/absent-add/'+$scope.employee.id+'?e=edit' :APP_URL+ 'employee/absent-add';
            var p =  EmployeeService.save($scope.absent,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.absent,$scope.forms.AbsentForm); 
                if($scope.modalstate.absent == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.absents,$scope.absent.id); } 
                if(!res.data.msg) { $scope.absent = {}; EmployeeService.refreshList($scope.absents, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editAbsent = function(id){
        $http.get(APP_URL+'employee/absent-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.absent =  data.data; 
        $scope.modalstate.absent="edit";
        });
    }

    $scope.deleteAbsent = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("absent",data,APP_URL+"employee/absent-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.absents,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){ });
        } 
    }

    $scope.resetAbsentForm =function(form){
        $scope.modalstate.absent="add";
        $scope.forms.AbsentForm.$setPristine(); $scope.forms.AbsentForm.$setUntouched(); 
        $scope.absent = {};
    }

    $scope.saveoneOffPayment = function() {  
        if(!$scope.forms.OneOffPaymentForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.oneoffPayment=== "edit" ? APP_URL+ 'employee/oneoff-pay-add/'+$scope.employee.id+'?e=edit' :APP_URL+ 'employee/oneoff-pay-add';
            var p =  EmployeeService.save($scope.oneoffPayment,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.oneoffPayment,$scope.forms.OneOffPaymentForm); 
                if($scope.modalstate.oneoffPayment == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.oneoffPayments,$scope.oneoffPayment.id); }
                if(!res.data.msg) { $scope.oneoffPayment = {}; EmployeeService.refreshList($scope.oneoffPayments, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editOneoffPay = function(id){
        $http.get(APP_URL+'employee/oneoff-pay-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.oneoffPayment =  data.data; 
            $scope.oneoffPayment.payment_id = ""+data.data.payment_id+"";
            $scope.oneoffPayment.taxable = ""+data.data.taxable+"";
            $scope.modalstate.oneoffPayment ="edit";
        });
    }

    $scope.deleteOneoffPay = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("oneoffPayment",data,APP_URL+"employee/oneoff-pay-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.oneoffPayments,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){  });
        } 
    }

    $scope.saveRecurringPayment = function(){
        if(!$scope.forms.RecurringPaymentForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.recurrentPayment=== "edit" ? APP_URL+'employee/recurring-pay-add/'+$scope.employee.id+'?e=edit' : APP_URL+'employee/recurring-pay-add';
            var p =  EmployeeService.save($scope.recurrentPayment,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.recurrentPayment,$scope.forms.RecurringPaymentForm); 
                if($scope.modalstate.recurrentPayment == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.recurrentPayments,$scope.recurrentPayment.id); }
                if(!res.data.msg) { $scope.recurrentPayment = {}; EmployeeService.refreshList($scope.recurrentPayments, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editRecurringPay = function(id){
        $http.get(APP_URL+'employee/recurring-pay-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.recurrentPayment =  data.data; 
        $scope.recurrentPayment.recurring_payment_id = ""+data.data.recurring_payment_id+"";
        $scope.recurrentPayment.taxable = ""+data.data.taxable+"";
        $scope.modalstate.recurrentPayment ="edit";
     });
    }

    $scope.toggleRecurringPay = function(e,id,v){
        $http.get(APP_URL+'employee/toggle-pay-recurring/'+e +'/'+id+'/'+v).then(function(data){
            if(data.data.success){
                var msg = data.data.success;
                $http.get(APP_URL+"employee/payments/"+e+"?recurring=rec").then(function(data){
                    $scope.recurrentPayments =data.data; 
                    toaster.success(msg);
                });
            }else{
                toaster.error(data.data.msg);
            }
        });
    }

    $scope.toggleRecurringDeduc = function(e,id,v){
        $http.get(APP_URL+'employee/toggle-deduc-recurring/'+e +'/'+id+'/'+v).then(function(data){
            if(data.data.success){
                var msg = data.data.success;
                $http.get(APP_URL+"employee/deductions/"+e+"?recurring=rec").then(function(data){
                    $scope.recurringDeductions =data.data; 
                    toaster.success(msg);
                });
            }else{
                toaster.error(data.data.msg);
            }
        });
    }

    $scope.deleteRecurringPay = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("recurrentPayment",data,APP_URL+"employee/recurring-pay-delete");
            del.then(function(res){
                if(res.data.success){
                    EmployeeService.removeListItem($scope.recurrentPayments,id);
                    toaster.success(res.data.success);
                }else{ toaster.error(res.data.error); }
            }, function(){  });
        } 
    }

    $scope.saveoneOffDeduction = function() {  
        if(!$scope.forms.oneOffDeductionForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.oneoffDeduction=== "edit" ? APP_URL+'employee/oneoff-deduction-add/'+$scope.employee.id+'?e=edit' : APP_URL+'employee/oneoff-deduction-add';
            var p =  EmployeeService.save($scope.oneoffDeduction,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.oneoffDeduction,$scope.forms.oneOffDeductionForm); 
                if($scope.modalstate.oneoffDeduction == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.oneoffDeductions,$scope.oneoffDeduction.id); }
                if(!res.data.msg) { $scope.oneoffDeduction = {}; EmployeeService.refreshList($scope.oneoffDeductions, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editOneoffDeduction = function(id){
        $http.get(APP_URL+'employee/oneoff-deduction-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.oneoffDeduction =  data.data; 
        $scope.oneoffDeduction.deduction_id = ""+data.data.deduction_id+"";
        $scope.modalstate.oneoffDeduction ="edit";
        });
    }

    $scope.deleteOneoffDeduction = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("oneoffDeduction",data,APP_URL+"employee/oneoff-deduction-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.oneoffDeductions,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){ });
        } 
    }

    $scope.saveRecurringDeduction = function(){
        if(!$scope.forms.RecurringDeductionForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.recurringDeduction=== "edit" ? APP_URL+ 'employee/recurring-deduction-add/'+$scope.employee.id+'?e=edit' : APP_URL+'employee/recurring-deduction-add';
            var p =  EmployeeService.save($scope.recurringDeduction,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.recurringDeduction,$scope.forms.RecurringDeductionForm); 
                if($scope.modalstate.recurringDeduction == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.recurringDeductions,$scope.recurringDeduction.id); }
                if(!res.data.msg) { $scope.recurringDeduction = {}; EmployeeService.refreshList($scope.recurringDeductions, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editRecurringDeduction = function(id){
        $http.get(APP_URL+'employee/recurring-deduction-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.recurringDeduction =  data.data; 
        $scope.recurringDeduction.recurring_deduction_id = ""+data.data.recurring_deduction_id+"";
        $scope.modalstate.recurringDeduction ="edit";
        });
    }

    $scope.deleteRecurringDeduction = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("recurringDeduction",data,APP_URL+"employee/recurring-deduction-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.recurringDeductions,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){  });
        } 
    }

    $scope.saveWorkDay = function(){
        if(!$scope.forms.WorkDayForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.workDay=== "edit" ? APP_URL+'employee/workday-add/'+$scope.employee.id+'?e=edit' : APP_URL+'employee/workday-add';
            var p =  EmployeeService.save($scope.workDay,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.workDay,$scope.forms.WorkDayForm); 
                if($scope.modalstate.workDay == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.workDays,$scope.workDay.id); }
                if(!res.data.msg) { $scope.workDay = {}; EmployeeService.refreshList($scope.workDays, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editWorkDay = function(id){
        $http.get(APP_URL+'employee/workday-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.workDay =  data.data; 
        $scope.modalstate.workDay ="edit";
        });
    }

    $scope.deleteWorkDay = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("workDay",data,APP_URL+"employee/workday-delete");
                del.then(function(res){
                    if(res.data.success){
                        EmployeeService.removeListItem($scope.workDays,id);
                        toaster.success(res.data.success);
                    }else{ toaster.error(res.data.error); }
                }, function(){ });
        } 
    }

    $scope.saveECurrency = function(){
        if(!$scope.forms.CurrencyForm.$invalid){
            BeforeHttp();
            var url = $scope.modalstate.currency=== "edit" ? APP_URL+'employee/currency-add/'+$scope.employee.id+'?e=edit' : APP_URL+'employee/currency-add';
            var p =  EmployeeService.save($scope.currency,$scope.employee,url);
            p.then(function(res){
                AfterHttp(res,$scope.currency,$scope.forms.CurrencyForm); 
                if($scope.modalstate.currency == "edit" && !res.data.msg) { EmployeeService.removeListItem($scope.currencies,$scope.currency.id); }
                if(!res.data.msg) { $scope.currency = {}; EmployeeService.refreshList($scope.currencies, res.data.data); }
            },function(){

            });
        }
    }

    $scope.editECurrency = function(id){
        $http.get(APP_URL+'employee/currency-add/'+id+'?emp='+$scope.employee.id).then(function(data){$scope.currency =  data.data; 
        $scope.currency.currency_id = ""+data.data.currency_id+"";
        $scope.modalstate.currency ="edit";
        });
    }

    $scope.deleteECurrency = function(id,emp_id){  
        var isConfirm = confirm("Are you sure you want this record deleted?");
        var data = {id:id,emp_id:emp_id};     
        if(isConfirm){
            var del = EmployeeService.delete("currency",data,APP_URL+"employee/currency-delete");
            del.then(function(res){
                if(res.data.success){
                    EmployeeService.removeListItem($scope.currencies,id);
                    toaster.success(res.data.success);
                }else{ toaster.error(res.data.error); }
            }, function(){ });
        } 
    }
}

function profileCtrl(APP_URL,$scope,$http,$window,toaster){
    $scope.profile = {};
    $scope.details = {};
    $scope.errors = {};

    $scope.profileImageUrl = "public/images/company.png";

    $scope.loaddata = function(){
        $http.get(APP_URL + 'company-profile?api=api',{cache:false}).then(function(res){
            $scope.profile = res.data.profile;
            $scope.details = res.data.details;
            if($scope.profile.logo == 1){
                $scope.profileImageUrl = "public/images/company.png";
                $scope.profileImageUrl = 'public/uploads/'+$scope.profile.folder+'/img/profile/default.png';
            }

            $scope.profile.state_id = ""+res.data.profile.state_id + "";
            $scope.profile.country_id = ""+res.data.profile.country_id + "";
            if($scope.details){
                $scope.details.sector_id = ""+res.data.details.sector_id + "";
            } 
        }); 
    }
    $scope.loaddata();
    $scope.loader = {
        //autoCheck: true,
        size: 32,
        fontColor: '#000000',
        bgColor: '#FFFFFF', 
        bgOpacity: 0.7,  
        title: '<b>Saving.. Please wait</b>', 
        isOnly: false
    };

    $scope.saveProfile = function(formValid){   
        if(formValid){
            $('.loadableProfile').loader($scope.loader);
            var new_data = {};
            new_data.profile = $scope.profile;
            new_data.details = $scope.details;
            $http({
                method:"post",
                url: APP_URL + "company-profile",
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                data: $.param(new_data)
            }).then(function(res){    
               $.loader.close(true);    
               if(res.data.success){
                    toaster.success(res.data.success);
                    $('.formDiv').hide();
                    $('.detailDiv').show();
               }else if(res.data.invalid){
                    $scope.errors = res.data.errors;
               }     
                
            },function(data){ 
                $.loader.close(true);
            })
        }
    }
    $scope.upload ={};

     $scope.saveLogo = function(){
        $('.loadableUpload').loader($scope.loader);
        var file = $scope.upload.logo;      
        var fd = new FormData();
        fd.append('logo', file);
        $http.post('update-profile-image', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
       }).then(function(res){
             $.loader.close(true);    
               if(res.data.success){
                    toaster.success(res.data.success);
                    window.location.reload();
                    $('.fileinput').fileinput('clear');
                    $('.logoForm').hide();
                    $('.logoDiv').show();
               }else if(res.data.invalid){
                    toaster.error(res.data.error);
               }  
       },function(){

       });
    }
}

function signUpCtrl(APP_URL,$scope, $http,$window){
    $scope.signUp = {};
    $scope.plans = {};
    $scope.isProcessing = false;
    $scope.cycles = {};

    $http.get(APP_URL+'plans').then(function(res){
        $scope.plans = res.data;
    });

    $http.get(APP_URL+'cycles').then(function(res){
        $scope.cycles = res.data;
    });

    $scope.signUpClient = function(formValid){
        $scope.errors = {};
        if(formValid){
            $scope.isProcessing = true;
            $http({url: APP_URL+'sign-up',
                method: "POST",
                data: $.param($scope.signUp),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){
                if(res.data.invalid){     
                    $scope.errors = res.data.errors;
                    if($scope.errors.email){
                        signUpForm['email'].focus();
                    }
                }else if(res.data.success){
                    $window.location = APP_URL + res.data.successUrl;
                }
                $scope.isProcessing = false;
            });
        }
    }
}

function signInCtrl(APP_URL,$scope, $http, $window){
    $scope.signIn = {};
    $scope.isProcessing=false;

    $scope.signInClient = function(formValid){
       if(formValid){
            $scope.isProcessing = true;
            $http({url: APP_URL+'sign-in',
                method: "POST",
                data: $.param($scope.signIn),
                headers: {'Content-Type':'application/x-www-form-urlencoded'}
            }).then(function(res){       
                if(res.data.invalid){     
                    $scope.errors = res.data.msg;
                }else if(res.data.success){
                    $window.location = res.data.redirectUrl;
                }
                $scope.isProcessing = false;
            },function(res){
                $scope.isProcessing = false;
            });
        }
    }
}


angular
    .module('payroll')
    .controller('dashboardCtrl',dashboardCtrl)
    .controller('MainCtrl',MainCtrl)
    .controller("paymentCtrl", paymentCtrl)
    .controller('recurringpaymentCtrl',recurringpaymentCtrl)
    .controller('deductionCtrl',deductionCtrl)
    .controller('recurringdeductionCtrl',recurringdeductionCtrl)
    .controller('departmentCtrl', departmentCtrl)
    .controller('LocReportCtrl', LocReportCtrl)
    .controller('locationCtrl', locationCtrl)
    .controller('currencyCtrl', currencyCtrl)
    .controller('payrollsetupCtrl',payrollsetupCtrl)
    .controller('reportCtrl',reportCtrl)
    .controller('pensionReportCtrl',pensionReportCtrl)
    .controller('nsitfReportCtrl',nsitfReportCtrl)
    .controller('remmitanceReportCtrl',remmitanceReportCtrl)
    .controller('DeptReportCtrl',DeptReportCtrl)
    .controller('taxReportCtrl',taxReportCtrl)
    .controller('employeeCtrl',employeeCtrl)
    .controller('slipCtrl', slipCtrl)
    .controller('empModalCrtl',empModalCrtl)
    .controller('payElementCtrl',payElementCtrl)
    //.controller('paystructureCtrl',paystructureCtrl)
    .controller('signUpCtrl', signUpCtrl)
    .controller('profileCtrl',profileCtrl)
    .controller('signInCtrl', signInCtrl)
