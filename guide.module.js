//////////////////////////////////////
// App : api						//
// Owner  : Kasun Wijeratne			//
// Last changed date : 2017/11/27	//
// Version : 6.1.0.6				//
// Modified By : Kasun				//
//////////////////////////////////////


(function ()
{
    'use strict';

    angular
        .module('app.guide', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
        mesentitlementProvider.setStateCheck("guide");

        $stateProvider
            .state('app.guide', {
                url    : '/guide',
                views  : {
                    'guide@app': {
                        templateUrl: 'app/main/guide/guide.html',
                        controller : 'GuideController as vm'
                    }
                },
                resolve: {
                   security: ['$q','mesentitlement', function($q,mesentitlement){
                        var entitledStatesReturn = mesentitlement.stateDepResolver('guide');

                        if(entitledStatesReturn !== true){
                              return $q.reject("unauthorized");
                        };
                    }]
                },
                bodyClass: 'guide'
            });

        msNavigationServiceProvider.saveItem('guide', {
            title    : 'Setup guide',
            state    : 'app.guide',
            weight   : 11
        });
    }
})();
