/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, Cookies */

(function(aRD){
    var
        _cookies                                        = {},
        _cookieSub                                      = {},
        _pageviewsCC                                    = {},
        _setCookie                                      = function(cookie, val){
            var opts                                    = {};
            if(cookie.expires){
                opts.expires                            = cookie.expires;
            }
            aRD.Cookies.set(cookie.name, val, opts);
            return aRD;
        },
        _addCookie                                      = function(name, opts){
            if( name && typeof(name) === 'string' ){
                var params                              = typeof(opts) === 'object' ? opts : {},
                    cookie                              = {
                        name                            : params.name || name,
                        value                           : params.value,
                        check                           : !!params.check,
                        expires                         : typeof(params.expires) === 'undefined' ? false : aRD.toNumber(params.expires),
                        apply                           : typeof(params.apply) === 'undefined' ? true : params.apply,
                        anyValue                        : typeof(params.value) === 'undefined'
                    },
                    val                                 = aRD.toJsValue(aRD.Cookies.get(cookie.name))
                ;
                _cookies[name]                          = cookie;
                switch(cookie.apply){
                    case 'everyview':
                    case 'pageview':
                        if( !_pageviewsCC[cookie.name] ){
                            _setCookie(cookie, aRD.isInt(val) ? ++val : 1);
                            _pageviewsCC[cookie.name]          = true;
                        }
                        cookie.value                    = aRD.isInt(cookie.value) ? cookie.value : 1;
                        cookie.anyValue                 = false;
                        break;
                    default:
                        cookie.apply                    = !!cookie.apply;
                        break;
                }
                if( typeof(params.parent) === 'string' ){
                    if( !_cookieSub[params.parent] ){
                        _cookieSub[params.parent]         = [];
                    }
                    _cookieSub[params.parent].push(name);
                }
            }
            return this;
        },
        _checkCookie                                    = function(name){
            if( aRD.Cookies ){
                var
                    pass                                = _doCheck(name),
                    needApply                           = [],
                    i, cookie
                ;
                if( pass && _cookieSub[name] ){
                    for (i = 0; i < _cookieSub[name]; i++) {
                        if( _doCheck(_cookieSub[name][i]) ){
                            if( _cookies[ _cookieSub[name][i] ].apply === true ){
                                needApply.push(_cookieSub[name][i]);
                            }
                        }else{
                            pass                        = false;
                        }
                    }
                }
                if( pass ){
                    if( _cookies[name].apply === true ){
                        needApply.unshift(name);
                    }

                    for (i = 0; i < needApply.length; i++) {
                        cookie                          = _cookies[ needApply[i] ];
                        if( cookie.check ){
                            aRD.Cookies.remove(cookie.name);
                        }else{
                            _setCookie(cookie, cookie.anyValue || cookie.value);
                        }
                    }

                    return true;
                }
            }
            return false;
        },
        _doCheck                                        = function(name){
            if( !(name && _cookies[name]) ){
                return false;
            }
            var cookie                                  = _cookies[name],
                value                                   = aRD.toJsValue(aRD.Cookies.get(cookie.name)),
                check                                   = false
            ;
            switch(cookie.apply){
                case 'everyview':
                    check                               = aRD.isInt(value) && (value % (aRD.isInt(cookie.value) ? cookie.value : 1) === 0 );
                    break;
                default:
                    check                               = !!(typeof(value) !== 'undefined' && (cookie.anyValue || value === cookie.value) );
            }
            return cookie.check === check;
        },
        _viewsCookieName                                = 'aoViewsCookie'
    ;
    aRD.Cookies                                         = typeof(Cookies) !== 'undefined' ? Cookies.noConflict() : false;
    aRD.addCookie                                       = _addCookie;
    aRD.checkCookie                                     = _checkCookie;

    if( aRD.Cookies ){
        var _views                                      = aRD.Cookies.get(_viewsCookieName);
        if( !aRD.isInt(_views) ){
            _views                                      = 0;
        }
        aRD.Cookies.set(_viewsCookieName, ++_views);
    }

    jQuery.extend(aRD.checks, {
        cookie                                          : {
            name                                            : 'cookie',
            type                                            : 'string',
            keyObj                                          : _cookies
        }
    });

    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-cookies]').each(function(i, el){
            var opts                                    = aRD.fromDataString( jQuery(el), 'aoCookies', {
                '_default'                              :{
                    type                                    : 'datastring',
                    params                                  : {
                        list                                    : [
                            { byCheck : {
                                name                        : 'apply',
                                allowed                     : [true, false, 'pageview', 'everyview']
                            } },
                            { byCheck : {
                                name                        : 'check',
                                type                        : 'boolean'
                            } },
                            { byCheck : aRD.createTypeCheck('expires', 'number') },
                            { byCheck : {
                                name                        : 'value'
                            } },
                            { byCheck : {
                                type                        : 'string',
                                name                        : 'name'
                            } },
                            { byCheck : {
                                type                        : 'string',
                                name                        : 'parent'
                            } }
                        ]
                    }
                }
            });
            jQuery.each(opts, function(name, opt){
                _addCookie(name, opt);
            });
        });

        $container[findFn]('[data-ao-check-cookie]').off('.aoCheckCookie').on('click.aoCheckCookie', function(){
            _checkCookie(jQuery(this).data('aoCheckCookie'));
        });
    });
})(aRunD);