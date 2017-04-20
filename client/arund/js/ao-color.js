/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Color requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Color requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var toRGBA                                              = function (hex, alpha, subColor, required){
            if( hex === 'transparent' || (required && !hex) ){
                if( subColor && subColor !== 'transparent' ){
                    return jQuery.extend(
                        {},
                        typeof(subColor) === 'object' ? subColor : toRGBA(subColor),
                        {a: 0}
                    );
                }else{
                    return {r:0, g:0, b:0, a:0};
                }
            }else if( typeof(hex) === 'object' ){
                return hex;
            }
            var _hex                                        = hex.charAt(0) === '#' ? hex.slice(1) : hex,
                partLength                                  = _hex.length/3,
                ret                                         = {},
                parts                                       = ['r', 'g', 'b'],
                tmp
            ;
            for (var i = 0; i < parts.length; i++) {
                tmp                                         = _hex.substring(i * partLength, (i + 1) * partLength);
                ret[parts[i]]                               = parseInt(tmp.length === 1 ? tmp + tmp : tmp, 16);
            }
            ret.a                                           = typeof(alpha) === 'number' ? alpha : 1;
            return ret;
        },
        stringify                                           = function (color){
            if( typeof(color) === 'string' ){
                return color.charAt(0) === '#' ? color : '#' + color;
            }else if( typeof(color) === 'object' ){
                if( color.a === 1 ){
                    var r                                   = hexPart(color.r),
                        g                                   = hexPart(color.g),
                        b                                   = hexPart(color.b)
                    ;
                    return '#' + ( r.charAt(0) === r.charAt(1) && r === g && r === b ? r + r.charAt(0) : r + g + b );
                }else{
                    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
                }
            }
        },
        hexPart                                             = function (val){
            if( val > 255 ){
                return 'FF';
            }else if( val < 0 ){
                return '00';
            }
            var hex                                         = val.toString(16);
            return (hex.length === 1) ? '0' + hex : hex;
        },
        hexReg                                              = "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})",
        rgbReg                                              = "rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)",
        rgbaReg                                             = "rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(1|0(?:\\.\\d+)?)\\)"
    ;
    aRD.type('color')
        .allowed(['transparent'])
        .regular("(?:(?:" + hexReg + ")|(?:" + rgbReg + ")|(?:" + rgbaReg + "))")
        .structure({
            properties                                  : {
                a                                           : {
                    type                                        : 'number',
                    required                                    : false
                },
                r                                           : 'number',
                g                                           : 'number',
                b                                           : 'number'
            }
        })
        .parser(function (value, type){
            switch(type){
                case 'string' :
                    if( value === 'transparent' ){
                        return value;
                    }else{
                        var matches                         = this._reg.exec(value);
                        if( matches && matches.length > 1 ){
                            if( matches[1] ){
                                return toRGBA(matches[1]);
                            }else if( matches[2] ){
                                //rgb
                                return {
                                    r                       : parseInt(matches[2]),
                                    g                       : parseInt(matches[3]),
                                    b                       : parseInt(matches[4]),
                                    a                       : 1
                                };
                            }else if( matches[5] ){
                                //rgba
                                return {
                                    r                       : parseInt(matches[5]),
                                    g                       : parseInt(matches[6]),
                                    b                       : parseInt(matches[7]),
                                    a                       : parseInt(matches[8])
                                };
                            }
                            
                        }
                    }
                    break;
                case 'object' :
                    if( this.checkStructure(value) ){
                        return {
                            r                               : value.r,
                            g                               : value.g,
                            b                               : value.b,
                            a                               : value.hasOwnProperty('a') ? value.a : 1
                        };
                    }
                    break;
            }
            return null;
        })
        .stringifier(function (value){
            if( value ){
                return value === 'transparent' ? value : stringify(value);
            }
            return '';
        })
    ;
    aRD.color                                               = {
        toRGBA                                              : toRGBA,
        stringify                                           : stringify,
        delta                                               : function (color1, color2, delta, toString){
            var _delta                                      = typeof(delta) === 'number' ? delta : 0.5,
                _color1                                     = typeof(color1) === 'object' ? color1 : toRGBA(color1, null, color2),
                _color2                                     = typeof(color2) === 'object' ? color2 : toRGBA(color2, null, color1),
                ret                                         = {
                    r                                       : aRD.delta(_color1.r, _color2.r, _delta),
                    g                                       : aRD.delta(_color1.g, _color2.g, _delta),
                    b                                       : aRD.delta(_color1.b, _color2.b, _delta),
                    a                                       : aRD.delta(_color1.a, _color2.a, _delta),
                }
            ;
            return toString ? stringify(ret) : ret;
        },
        RGBAdiff                                            : function (rgba1, rgba2){
            var ret                                         = [],
                parts                                       = ['r', 'g', 'b', 'a']
            ;
            for (var i = 0; i < parts.length; i++) {
                if( rgba1[parts[i]] !== rgba2[parts[i]] ){
                    ret.push(parts[i]);
                }
            }
            return ret;
        }
    };
}));