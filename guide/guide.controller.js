(function ()
{
	'use strict';

	angular
		.module('app.setupguide')
		.controller('GuideController',  GuideController);

	/** @ngInject */
	function GuideController( $scope,$http,$charge,$timeout,$interval,$cookies, $productHandler)
	{
		var vm = this;
		$scope.selectedGuidePanel = 0;
		$scope.isPanel0Active = false;
		$scope.isPanel1Active = false;
		$scope.isPanel2Active = false;
		$scope.isPanel3Active = false;
		$scope.isPanel4Active = false;
		$scope.isPanel5Active = false;
		$scope.savedCompanyInfo = [];
		$scope.selectedDataSetting = '';
		$scope.isGLPanel0Done = false;
		$scope.selectAllApps = false;
		$scope.migrateThese = [];
		$scope.migrateInitilized = false;

		vm.liveLoaderValue = 0;
		vm.modes = [ ];
		var j= 0, counter = 0;
		vm.activated = true;
		$scope.panelActiveCounter = 0;
		vm.alreadyDone = [];


		$scope.appsToMigrate = [{
			'name':'settings',
			'migrateDBToLIve':false
		},{
			'name':'plans',
			'migrateDBToLIve':false
		},{
			'name':'subscriptions',
			'migrateDBToLIve':false
		},{
			'name':'coupons',
			'migrateDBToLIve':false
		},{
			'name':'invoice',
			'migrateDBToLIve':false
		},{
			'name':'360',
			'migrateDBToLIve':false
		}];

		$scope.svgset = false;

		// $scope.$watch('panelActiveCounter',function () {
		// 	if(!$scope.isPanel0Active){
		// 		$scope.selectedGuidePanel = 0;
		// 		$scope.svgset = true;
		// 	}else{
		// 		if($scope.panelActiveCounter >= 3){
		// 			$scope.selectedGuidePanel = vm.alreadyDone.length + 1;
		// 			$scope.svgset = true;
		// 		}
		// 	}
		// });

		function logout()
		{
			// $auth.logout().onLogoutSuccess(console.log("hurray logout!")).onLogoutError(console.log("itdoesnt work logout!")
			var cook = $cookies.getAll();
			var cookarray = $.map(cook, function(value, index) {
				return [value];
			});
			angular.forEach(cookarray, function (cook) {
				$cookies.remove(cook);
			});
			location.replace("https://cloudcharge.com/azuresignup/ccAzure.php/logout");
		}

		function gst(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			//debugger;
			return null;
		}

		function getDomainName() {
			var _st = gst("domain");
			return (_st != null) ? _st : ""; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}
		function getDomainExtension() {
			var _st = gst("extension_mode");
			return (_st != null) ? _st : "test"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		$scope.accCat = gst('category');

		(function () {
			var val=localStorage.getItem("isPanel4Active");
			if(val){
				$scope.isPanel3Active = true;
				$scope.panelActiveCounter++;
				vm.alreadyDone.push('ok');
			}else{
				$scope.panelActiveCounter++;
			}
		})();

		$scope.idToken= gst('securityToken');

		// Get currently saved details for inspection

		// Company details
		if($scope.accCat == 'subscription'){
			$charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
				angular.forEach(data, function (piece) {
					if(piece.RecordFieldData != ""){
						$scope.savedCompanyInfo.push(piece.RecordFieldData);
					}
				});

				$charge.settingsapp().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
					var BaseCurrency=data[0].RecordFieldData;
					if($scope.savedCompanyInfo.length >= 4 && BaseCurrency != null && BaseCurrency != 203 && BaseCurrency != ''){
						$scope.isPanel0Active = true;
						// $scope.panelActiveCounter++;
						// vm.alreadyDone.push('ok');
						$scope.selectedGuidePanel = 1;
						$scope.openSelectedGuidePanel(1,1);

						// Plans
						$charge.plan().allPlans(0,100,'desc').success(function(data){
							if(data.length != 0){
								$scope.isPanel1Active = true;
								// $scope.panelActiveCounter++;
								// vm.alreadyDone.push('ok');
								$scope.selectedGuidePanel = 2;
								$scope.openSelectedGuidePanel(2,2);
								//Payment gateways
								$charge.paymentgateway().availableGateways().success(function (data) {
									if(data.status) {
										$scope.currentGateways = data.data.availableGateway;
										if(data.data.connectedGatways != null){
											if(data.data.connectedGatways.stripe.length > 0){
												$scope.isPanel2Active = true;
												// $scope.panelActiveCounter++;
												// vm.alreadyDone.push('ok');
												$scope.openSelectedGuidePanel(3,3);
												$scope.selectedGuidePanel = 3;
												$scope.svgset = true;

												//Subscriptions
												var dbNamePart1 = getDomainName().split('.')[0];
												var dbNamePart2 = getDomainExtension();
												var dbName = dbNamePart1+'_'+dbNamePart2;
												var data={
													"search": "*",
													"filter": "(domain eq '"+dbName+"' and status eq 'All')",
													"orderby" : "endDate asc",
													"top":100,
													"skip":0
												}
												$charge.azuresearch().getAllSubscriptionPost(data).success(function(res) {
													console.log(res);
													$scope.isPanel3Active = true;
													// $scope.panelActiveCounter++;
													// vm.alreadyDone.push('ok');
													$scope.selectedGuidePanel = 4;
													$scope.openSelectedGuidePanel(4);
													$scope.svgset = true;
												}).error(function(res) {
													console.log(res);
													// $scope.panelActiveCounter++;
													$scope.selectedGuidePanel = 3;
													$scope.svgset = true;
													return -1;
												});
											}else{
												$scope.selectedGuidePanel = 2;
												$scope.svgset = true;
												return -1;
											}
										}else{
											$scope.selectedGuidePanel = 2;
											$scope.svgset = true;
											return -1;
										}
									}else{
										$scope.selectedGuidePanel = 2;
										$scope.svgset = true;
										return -1;
									}
								}).error(function(data) {
									$scope.selectedGuidePanel = 2;
									$scope.svgset = true;
									return -1;
								});
							}
						}).error(function (errorResponse) {
							$scope.selectedGuidePanel = 1;
							$scope.svgset = true;
							return -1;
						});
					}else{
						$scope.selectedGuidePanel = 0;
						$scope.openSelectedGuidePanel(0,0);
						$scope.svgset = true;
						return -1;
					}
				}).error(function (response) {
					$scope.selectedGuidePanel = 0;
					$scope.svgset = true;
					return -1;
				});
			}).error(function (errorResponse) {
				$scope.selectedGuidePanel = 0;
				$scope.openSelectedGuidePanel(0,0);
				$scope.svgset = true;
				return -1;
			});
		}
		else if($scope.accCat == 'invoice'){
			$charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
				angular.forEach(data, function (piece) {
					if(piece.RecordFieldData != ""){
						$scope.savedCompanyInfo.push(piece.RecordFieldData);
					}
				});

				$charge.settingsapp().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
					var BaseCurrency=data[0].RecordFieldData;
					if($scope.savedCompanyInfo.length >= 4 && BaseCurrency != null && BaseCurrency != 203 && BaseCurrency != ''){
						$scope.isPanel0Active = true;
						// $scope.panelActiveCounter++;
						// vm.alreadyDone.push('ok');
						$scope.selectedGuidePanel = 1;
						$scope.openSelectedGuidePanel(1,1);

						// Plans
						$productHandler.getClient().LoadProductByScroll(0,100).onComplete(function(data){
							if(data.length > 0){
								$scope.isPanel1Active = true;
								// $scope.panelActiveCounter++;
								// vm.alreadyDone.push('ok');
								$scope.selectedGuidePanel = 2;
								$scope.openSelectedGuidePanel(2,2);
								//Payment gateways
								$charge.paymentgateway().availableGateways().success(function (data) {
									if(data.status) {
										$scope.currentGateways = data.data.availableGateway;
										if(data.data.connectedGatways != null){
											if(data.data.connectedGatways.stripe.length > 0){
												$scope.isPanel2Active = true;
												// $scope.panelActiveCounter++;
												// vm.alreadyDone.push('ok');
												$scope.openSelectedGuidePanel(3,3);
												$scope.selectedGuidePanel = 3;
												$scope.svgset = true;

												//Subscriptions
												var dbNamePart1 = getDomainName().split('.')[0];
												var dbNamePart2 = getDomainExtension();
												var dbName = dbNamePart1+'_'+dbNamePart2;
												var data={
													"search": "*",
													"filter": "(domain eq '"+dbName+"' and status eq 'All')",
													"orderby" : "endDate asc",
													"top":100,
													"skip":0
												}
												$charge.invoice().all(0,100,"desc").success(function(data) {
													if(data.length > 0){
														console.log(data);
														$scope.isPanel3Active = true;
														// $scope.panelActiveCounter++;
														// vm.alreadyDone.push('ok');
														$scope.selectedGuidePanel = 4;
														$scope.openSelectedGuidePanel(4);
														$scope.svgset = true;
													}
												}).error(function(res) {
													console.log(res);
													// $scope.panelActiveCounter++;
													$scope.selectedGuidePanel = 3;
													$scope.svgset = true;
													return -1;
												});
											}else{
												$scope.selectedGuidePanel = 2;
												$scope.svgset = true;
												return -1;
											}
										}else{
											$scope.selectedGuidePanel = 2;
											$scope.svgset = true;
											return -1;
										}
									}else{
										$scope.selectedGuidePanel = 2;
										$scope.svgset = true;
										return -1;
									}
								}).error(function(data) {
									$scope.selectedGuidePanel = 2;
									$scope.svgset = true;
									return -1;
								});
							}
						}).onError(function (errorResponse) {
							$scope.selectedGuidePanel = 1;
							$scope.svgset = true;
							return -1;
						});
					}else{
						$scope.selectedGuidePanel = 0;
						$scope.openSelectedGuidePanel(0,0);
						$scope.svgset = true;
						return -1;
					}
				}).error(function (response) {
					$scope.selectedGuidePanel = 0;
					$scope.svgset = true;
					return -1;
				});
			}).error(function (errorResponse) {
				$scope.selectedGuidePanel = 0;
				$scope.openSelectedGuidePanel(0,0);
				$scope.svgset = true;
				return -1;
			});
		}

		$scope.openSelectedGuidePanel = function (panelIndex, container) {
			$scope.svgset = false;
			var invoiceAddon = "";
			if($scope.accCat == 'invoice' && container == 1)
				invoiceAddon = '_invoice';
			var currentContainer = angular.element('#container'+container);
			if(currentContainer != undefined){
				if(currentContainer.find('svg') != undefined){
					currentContainer.find('svg').remove();
				}
			}
			$scope.selectedGuidePanel = panelIndex;
			var animation = bodymovin.loadAnimation({
				container:document.getElementById('container'+container),
				renderer:'svg',
				loop:true,
				autoplay:true,
				path:'app/main/guide/container'+container+invoiceAddon+'.json'
			});
			if(animation){
				$scope.svgset = true;
			}
		};

		$scope.activateTIOPanel = function () {
			localStorage.setItem("isPanel4Active", true);
		};

		$scope.selectDataSetting = function (setting) {
			var element = document.getElementById('guideScrollContent');
			if(setting == 'fresh'){
				$scope.selectedDataSetting = 'fresh';
				element.scrollTop = 0;
			}else{
				$scope.selectedDataSetting = 'migrate';
				var element = document.getElementById('guideScrollContent');
				$timeout(function(){
					element.scrollTop = element.scrollHeight - element.clientHeight;
				},0);
			}
		};

		$scope.stepupGL = function () {
			$scope.isGLPanel0Done = true;
		}

		$scope.stepDownGL = function () {
			$scope.isGLPanel0Done = false;
		}

		// Select all the apps to be migrated
		// $scope.selectAllToMigrate = function () {
		// 	// $scope.selectAllApps = !$scope.selectAllApps;
		// 	if($scope.selectAllApps) {
		// 		angular.forEach($scope.appsToMigrate, function (app) {
		// 			app.migrateDBToLIve = false;
		// 		});
		// 		$timeout(function () {
		// 			$scope.selectAllApps = false;
		// 		});
		// 	}else{
		// 		angular.forEach($scope.appsToMigrate, function (app) {
		// 			app.migrateDBToLIve = true;
		// 		});
		// 		$timeout(function () {
		// 			$scope.selectAllApps = true;
		// 		});
		// 	}
		// };
		vm.toggleActivation = function() {
			if ( !vm.activated ) vm.modes = [ ];
			if (  vm.activated ) j = counter = 0;
		};

		// $scope.runLiveProgress = function () {
		// 	$interval(function() {
		// 		vm.liveLoaderValue += 1;
		// 		if (vm.liveLoaderValue > 100) {
		// 			vm.liveLoaderValue = 30;
		// 		}
		// 		if ( (j < 5) && !vm.modes[j] && vm.activated ) {
		// 			vm.modes[j] = 'indeterminate';
		// 		}
		// 		if ( counter++ % 4 == 0 ) j++;
		// 	}, 2000, 0, true);
		// };
		//
		// $scope.goLive = function () {
		//
		// 	// var data = {
		// 	// 	"tables":[]
		// 	// };
		// 	$scope.migrateInitilized = true;
		// 	var data = {
		// 		"withdata":false
		// 	};
		// 	// $scope.isLiveStarted = true;
		// 	// $scope.runLiveProgress();
		// 	if($scope.selectedDataSetting == 'migrate'){
		// 		// angular.forEach($scope.appsToMigrate, function (app) {
		// 		// 	if(app.migrateDBToLIve){
		// 		// 		data.tables.push(app.name);
		// 		// 	}
		// 		// });
		// 		data.withdata = true;
		// 	}
		//
		// 	$http({
		// 		method : 'POST',
		// 		url : "http://cloudcharge.com/services/duosoftware.tenant.service/db/switchmode?mode=live",
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			'idToken':$scope.idToken
		// 		},
		// 		data : JSON.stringify(data)
		//
		// 	}).then(function(response) {
		// 		console.log(response);
		// 		$scope.migrateInitilized = false;
		// 		$scope.showLogoutScreen = true;
		// 		logout();
		// 		// $timeout(function () {
		// 		// 	logout();
		// 		// }, 2000)
		//
		// 	}, function (errorResponse) {
		// 		console.log(errorResponse);
		// 	});
		//
		// 	// $http({
		// 	// 	method : 'POST',
		// 	// 	url : "http://app.cloudcharge.com/services/duosoftware.tenant.service/db/migration?mode=live",
		// 	// 	headers: {
		// 	// 		'Content-Type': 'application/json',
		// 	// 		'idToken':$scope.idToken
		// 	// 	},
		// 	// 	data : {
		// 	// 		"tables":JSON.stringify(data)
		// 	// 	}
		// 	// }).then(function(response) {
		// 	// 	console.log(response);
		// 	// 	$scope.isLiveStarted = false;
		// 	// }, function (errorResponse) {
		// 	// 	console.log(errorResponse);
		// 	// 	$scope.isLiveStarted = false;
		// 	// });
		// }
		//
		// $scope.showToLiveConfirmation = function (doThis) {
		// 	var element = document.getElementById('guideScrollContent');
		// 	if(doThis){
		// 		$timeout(function(){
		// 			element.scrollTop = element.scrollHeight - element.clientHeight;
		// 		},0);
		// 	}else{
		// 		element.scrollTop = 0;
		// 	}
		// 	$scope.confirmLiveSwitch = doThis;
		// }
	}
})();
