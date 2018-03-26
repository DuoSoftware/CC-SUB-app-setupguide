//////////////////////////////////////
// App : api						//
// Owner  : Kasun Wijeratne			//
// Last changed date : 2018/02/11	//
// Version : 6.1.0.7				//
// Modified By : Kasun				//
//////////////////////////////////////


(function ()
{
    'use strict';

    angular
        .module('app.setupguide', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {

        $stateProvider
            .state('app.setupguide', {
                url    : '/setupguide',
                views  : {
                    'setupguide@app': {
                        templateUrl: 'app/main/guide/guide.html',
                        controller : 'GuideController as vm'
                    }
                },
                resolve: {
                   security: ['$q','mesentitlement', function($q,mesentitlement){
					   mesentitlementProvider.setStateCheck("setupguide");
					   var entitledStatesReturn = mesentitlement.stateDepResolver('setupguide');

                        // if(entitledStatesReturn !== true){
                        //       return $q.reject("unauthorized");
                        // };
                    }]
                },
                bodyClass: 'setupguide'
            });

        msNavigationServiceProvider.saveItem('setupguide', {
            title    : 'Setup guide',
            state    : 'app.setupguide',
            weight   : 11
        });
    }
})();
