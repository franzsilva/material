/*
 * @ngdoc module
 * @name material.services.interimElement
 * @description InterimElement
 */

angular.module('material.services.interimElement', [
  'material.services.compiler',
  'material.services.theming'
])
.factory('$$interimElement', [
  '$q',
  '$rootScope',
  '$timeout',
  '$rootElement',
  '$animate',
  '$mdCompiler',
  '$mdTheming',
  InterimElementFactory
]);

/*
 * @ngdoc service
 * @name $$interimElement
 *
 * @description
 *
 * Factory that contructs `$$interimElement.$service` services. 
 * Used internally in material design for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('$mdToast', function($$interimElement) {
 *   var $mdToast = $$interimElement(toastDefaultOptions);
 *   return $mdToast;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {$$interimElement.$service}
 *
 */

function InterimElementFactory($q, $rootScope, $timeout, $rootElement, $animate, $mdCompiler, $mdTheming) {

  return function createInterimElementService(defaults) {

    /*
     * @ngdoc service
     * @name $$interimElement.$service
     *
     * @description
     * A service used to control inserting and removing an element into the DOM.
     *
     */


    var stack = [];


    defaults = angular.extend({
      onShow: function(scope, $el, options) {
        return $animate.enter($el, options.parent);
      },
      onRemove: function(scope, $el, options) {
        return $animate.leave($el);
      },
    }, defaults || {});

    // Store extra chainable methods for use later (see make)
    var extraConfigMethods = defaults.configMethods || [];
    delete defaults.configMethods;

    var service;

    return service = {
      make: make,
      hide: hide,
      cancel: cancel
    };

    /**
     * @ngdoc method
     * @name $$interimElement.$service#make
     * @kind function
     *
     * @description
     * Creates a new interim element, not yet inserted
     *
     * @param {Object} options Options object to set on the interim element.
     *
     * @returns {Object} Publicly facing API for an interim element, which has show
     * and chainable configuration methods.
     *
     */

    function make(options) {
      angular.extend(options || {}, defaults);
      var interimElement = new InterimElement(options);
      var publicApi = {
        show: angular.bind(null, show, interimElement)
      };

      var configMethods = [
        'controller', 'controllerAs', 'template', 'templateUrl', 'transformTemplate',
        'resolve', 'themable', 'onShow', 'onRemove'
      ];
      configMethods.concat(extraConfigMethods).forEach(function(method) {
        publicApi[method] = function(opt) {
          interimElement.options[method] = opt;
          return publicApi;
        };
      });
      return publicApi;
    }

    function show(interimElement, options) {
      if (stack.length) {
        service.hide();
      }

      angular.extend(interimElement.options, options);

      stack.push(interimElement);
      return interimElement.show().then(function() {
        return interimElement.deferred.promise;
      });
    }

    /*
     * @ngdoc method
     * @name $$interimElement.$service#hide
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
     *
     * @param {*} resolveParam Data to resolve the promise with
     *
     * @returns undefined data that resolves after the element has been removed.
     *
     */
    function hide(success) {
      var interimElement = stack.shift();
      interimElement && interimElement.remove().then(function() {
        interimElement.deferred.resolve(success);
      });
    }

    /*
     * @ngdoc method
     * @name $$interimElement.$service#cancel
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
     *
     * @param {*} reason Data to reject the promise with
     *
     * @returns undefined
     *
     */
    function cancel(reason) {
      var interimElement = stack.shift();
      interimElement && interimElement.remove().then(function() {
        interimElement.deferred.reject(reason);
      });
    }


    /*
     * Internal Interim Element Object
     * Used internally to manage the DOM element and related data
     */
    function InterimElement(options) {
      var self;
      var hideTimeout, element;

      options = options || {};

      options = angular.extend({
        scope: options.scope || $rootScope.$new(options.isolateScope)
      }, defaults, options);

      return self = {
        options: options,
        deferred: $q.defer(),
        show: function() {
          return $mdCompiler.compile(options).then(function(compiledData) {
            // Search for parent at insertion time, if not specified
            if (!options.parent) {
              options.parent = $rootElement.find('body');
              if (!options.parent.length) options.parent = $rootElement;
            }
            element = compiledData.link(options.scope);
            if (options.themable) $mdTheming(element);
            var ret = options.onShow(options.scope, element, options);
            return $q.when(ret)
              .then(function(){
                  // Issue onComplete callback when the `show()` finishes
                  var notify = options.onComplete || angular.noop;
                  notify.apply(null, [options.scope, element, options]);
              })
              .then(startHideTimeout);

            function startHideTimeout() {
              if (options.hideDelay) {
                hideTimeout = $timeout(service.hide, options.hideDelay) ;
              }
            }
          });
        },
        cancelTimeout: function() {
          if (hideTimeout) {
            $timeout.cancel(hideTimeout);
            hideTimeout = undefined;
          }
        },
        remove: function() {
          self.cancelTimeout();
          var ret = options.onRemove(options.scope, element, options);
          return $q.when(ret).then(function() {
            options.scope.$destroy();
          });
        }
      };
    }
  };
}

