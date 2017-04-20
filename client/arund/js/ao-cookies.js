/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD, Cookies */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Cookies requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Cookies requires aRunD to be loaded first';
    }
    if (typeof Cookies === 'undefined') {
        throw 'aRunD Cookies requires Cookies library to be loaded first';
    }
    fn(jQuery, aRunD, Cookies);
}(function ($, aRD, Cookies) {
    var cookies                                             = {},
        cookieSub                                           = {},
        pageviewsCC                                         = {},
        setCookie                                           = function (cookie, val){
            var opts                                        = {};
            if(cookie.expires){
                opts.expires                                = cookie.expires;
            }
            Cookies.set(cookie.name, val, opts);
            return aRD;
        },
        addCookie                                           = function (name, opts){
            if( name && typeof(name) === 'string' ){
                var params                                  = typeof(opts) === 'object' ? opts : {},
                    cookie                                  = {
                        name                                : params.name || name,
                        value                               : params.value,
                        check                               : !!params.check,
                        expires                             : typeof(params.expires) === 'undefined' ? false : aRD.toNumber(params.expires),
                        apply                               : typeof(params.apply) === 'undefined' ? true : params.apply,
                        anyValue                            : typeof(params.value) === 'undefined'
                    },
                    val                                     = aRD.toJsValue(Cookies.get(cookie.name))
                ;
                cookies[name]                               = cookie;
                switch(cookie.apply){
                    case 'everyview':
                    case 'pageview':
                        if( !pageviewsCC[cookie.name] ){
                            setCookie(cookie, aRD.isInt(val) ? ++val : 1);
                            pageviewsCC[cookie.name]        = true;
                        }
                        cookie.value                        = aRD.isInt(cookie.value) ? cookie.value : 1;
                        cookie.anyValue                     = false;
                        break;
                    default:
                        cookie.apply                        = !!cookie.apply;
                        break;
                }
                if( typeof(params.parent) === 'string' ){
                    if( !cookieSub[params.parent] ){
                        cookieSub[params.parent]            = [];
                    }
                    cookieSub[params.parent].push(name);
                }
            }
            return this;
        },
        doCheck                                             = function (name){
            if( !(name && cookies[name]) ){
                return false;
            }
            var cookie                                      = cookies[name],
                value                                       = aRD.toJsValue(Cookies.get(cookie.name)),
                check                                       = false
            ;
            switch(cookie.apply){
                case 'everyview':
                    check                                   = aRD.isInt(value) && (value % (aRD.isInt(cookie.value) ? cookie.value : 1) === 0 );
                    break;
                default:
                    check                                   = !!(typeof(value) !== 'undefined' && (cookie.anyValue || value === cookie.value) );
            }
            return cookie.check === check;
        },
        checkCookie                                         = function (name){
            if( Cookies ){
                var
                    pass                                    = doCheck(name),
                    needApply                               = [],
                    i, cookie
                ;
                if( pass && cookieSub[name] ){
                    for (i = 0; i < cookieSub[name]; i++) {
                        if( doCheck(cookieSub[name][i]) ){
                            if( cookies[ cookieSub[name][i] ].apply === true ){
                                needApply.push(cookieSub[name][i]);
                            }
                        }else{
                            pass                            = false;
                        }
                    }
                }
                if( pass ){
                    if( cookies[name].apply === true ){
                        needApply.unshift(name);
                    }

                    for (i = 0; i < needApply.length; i++) {
                        cookie                              = cookies[ needApply[i] ];
                        if( cookie.check ){
                            Cookies.remove(cookie.name);
                        }else{
                            setCookie(cookie, cookie.anyValue || cookie.value);
                        }
                    }

                    return true;
                }
            }
            return false;
        },
        viewsCookieName                                     = 'aoViewsCookie',
        dataParser                                          = aRD.parser.newData({
            default                                         : {
                type                                            : {
                    list                                            : [
                        { checks : {
                            name                                        : 'apply',
                            allowed                                     : [true, false, 'pageview', 'everyview']
                        } },
                        { checks : {
                            name                                        : 'check',
                            type                                        : 'boolean'
                        } },
                        { checks : aRD.parser.newCheck('expires', 'number') },
                        { checks : {
                            name                                        : 'value'
                        } },
                        { checks : {
                            type                                        : 'string',
                            name                                        : 'name'
                        } },
                        { checks : {
                            type                                        : 'string',
                            name                                        : 'parent'
                        } }
                    ]
                }
            }
        })
    ;

    aRD.cookie                                              = {
        browser                                             : Cookies,
        add                                                 : addCookie,
        check                                               : checkCookie,
        parse                                               : function (value){
            return dataParser.parse(value);
        },
        stringify                                           : function (value){
            return dataParser.stringify(value);
        }
    };

    if( Cookies ){
        var views                                           = Cookies.get(viewsCookieName);
        if( !aRD.isInt(views) ){
            views                                           = 0;
        }
        Cookies.set(viewsCookieName, ++views);
    }

    aRD.parser.check('cookie', {
        name                                                : 'cookie',
        keyObj                                              : cookies
    });

    aRD.pushFlist('init', function ($container, findFn){
        $container[findFn]('[data-ao-cookies]').each(function (i, el){
            var opts                                        = dataParser.parse(jQuery(el).data('aoCookies'));
            jQuery.each(opts, function (name, opt){
                addCookie(name, opt);
            });
        });

        $container[findFn]('[data-ao-check-cookie]').off('.aoCheckCookie').on('click.aoCheckCookie', function (){
            checkCookie(jQuery(this).data('aoCheckCookie'));
        });
    });
}));