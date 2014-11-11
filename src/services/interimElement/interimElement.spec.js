describe('$$interimElement service', function() {
  var $compilerSpy, $themingSpy, resolvingPromise;

  beforeEach(module('material.services.interimElement', 'ngAnimateMock', function($provide) {
    var $mdCompiler = { compile: angular.noop };
    $compilerSpy = spyOn($mdCompiler, 'compile');
    $themingSpy = jasmine.createSpy('$mdTheming');

    $provide.value('$mdCompiler', $mdCompiler);
    $provide.value('$mdTheming', $themingSpy);
  }));

  beforeEach(inject(function($q, $compile) {
    $compilerSpy.andCallFake(function(opts) {
      var el = $compile(opts.template);
      var deferred = $q.defer();
      deferred.resolve({
        link: el
      });
      return deferred.promise;
    });
  }));

  describe('a service', function() {
    var Service;
    beforeEach(inject(function($$interimElement) {
      Service = $$interimElement();
    }));

    it('allows specifying of additional instance config methods', inject(function($$interimElement) {
      Service = $$interimElement({configMethods: 'hello'});
      var instance = Service.make();
      expect(instance.hello('World')).toBe(instance);
      instance.show();
      expect($compilerSpy.mostRecentCall.args[0].hello).toBe('World');
    }));

    describe('#create', function() {
      describe('instance#show', function() {
        it('inherits default options', inject(function($$interimElement) {
          var defaults = { templateUrl: 'testing.html' };
          Service = $$interimElement(defaults);
          Service.make().show();
          expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
        }));

        it('inherits make options', inject(function($$interimElement) {
          var defaults = { templateUrl: 'testing.html' };
          Service = $$interimElement();
          Service.make(defaults).show();
          expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
        }));

        it('forwards options to $mdCompiler', inject(function($$interimElement) {
          var options = {template: '<testing />'};
          Service.make().show(options);
          expect($compilerSpy.mostRecentCall.args[0].template).toBe('<testing />');
        }));

        it('supports theming', inject(function($$interimElement, $rootScope) {
          Service.make().show({themable: true});
          $rootScope.$digest();
          expect($themingSpy).toHaveBeenCalled();
        }));

        it('calls hide after hideDelay', inject(function($animate, $timeout, $rootScope) {
          var hideSpy = spyOn(Service, 'cancel').andCallThrough();
          Service.make().show({hideDelay: 1000});
          $rootScope.$digest();
          $animate.triggerCallbacks();
          $timeout.flush();
          expect(hideSpy).toHaveBeenCalled();
        }));

        it('calls onRemove', inject(function($rootScope) {
          var onRemoveCalled = false;
          Service.make().show({
            template: '<some-element />',
            isPassingOptions: true,
            onRemove: onRemove
          });
          $rootScope.$digest();
          Service.hide();
          $rootScope.$digest();
          expect(onRemoveCalled).toBe(true);

          function onRemove(scope, el, options) {
            onRemoveCalled = true;
            expect(options.isPassingOptions).toBe(true);
            expect(el[0]).toBeTruthy();
          }
        }));

        it('returns a promise', inject(function($$interimElement) {
          expect(typeof Service.make().show().then).toBe('function');
        }));
      });
    });


    describe('#hide', function() {
      it('calls onRemove', inject(function($rootScope) {
        var onRemoveCalled = false;
        Service.make().show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        Service.hide();
        $rootScope.$digest();
        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('resolves the show promise', inject(function($animate, $rootScope) {
        var resolved = false;

        Service.make().show().then(function(arg) {
          expect(arg).toBe('test');
          resolved = true;
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.hide('test');
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(resolved).toBe(true);
      }));
    });

    describe('#cancel', function() {
      it('calls onRemove', inject(function($rootScope) {
        var onRemoveCalled = false;
        Service.make().show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        Service.cancel();
        $rootScope.$digest();
        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('rejects the show promise', inject(function($animate, $rootScope) {
        var rejected = false;

        Service.make().show().then(undefined, function(arg) {
          expect(arg).toBe('test');
          rejected = true;
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.cancel('test');
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(rejected).toBe(true);
      }));
    });
  });
});

