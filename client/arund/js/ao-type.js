/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Type requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Type requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    /* Data type */
        var list                                            = {},
            DataType                                        = function (){
                this._default                               = null;
            },
            stringify                                       = function (val){
                if( val === null ){
                    return '';
                }
                var type                                    = typeof val;
                switch(type){
                    case 'object':
                        return JSON.stringify(val);
                    default :
                        return '' + val;
                }
            },
            checkType                                       = function (val, rType, type){
                return rType === type || (list[rType] && list[rType].test(val));
            },
            checkAnyRequired                                = function (val, required){
                for (var i = 0; i < required.length; i++) {
                    if( isSet(aRD.getPropertyByName(val, required[i])) ){
                        return true;
                    }
                }
                return false;
            },
            checkRequiredList                               = function (val, required){
                for (var i = 0; i < required.length; i++) {
                    if( required[i] instanceof Array ? !checkAnyRequired(val, required[i]) : !isSet(aRD.getPropertyByName(val, required[i])) ){
                        return false;
                    }
                }
                return true;
            },
            isSet                                           = function (val){
                return !(typeof val === 'undefined' || val === null || val === '');
            },
            checkRequired                                   = function (val, required){
                if( required instanceof Array ){
                    return checkRequiredList(val, required);
                }
                return !required || isSet(val);
            },
            checkStructure                                  = function (val, structure){
                if(structure instanceof Array && jQuery.inArray(val, structure) > -1){
                    return true;
                }
                var type                                    = typeof val,
                    sType                                   = typeof structure,
                    name
                ;
                switch(sType){
                    case 'object' :
                        var required                        = aRD.getPropertyByName(structure, 'required', true),
                            pass                            = checkRequired(val, required)
                        ;
                        if( !required && pass ){
                            return true;
                        }
                        if( pass &&
                            (!structure.type || checkType(val, structure.type, type)) &&
                            (!structure.allowed || jQuery.inArray(val, structure.allowed) > -1) &&
                            (!structure.properties || type === sType)
                            ){
                            if( structure.properties && val ){
                                for (name in structure.properties) {
                                    if( !checkStructure(val[name], structure.properties[name]) ){
                                        return false;
                                    }
                                }
                            }
                        }else{
                            return false;
                        }
                        break;
                    case 'string' :
                        return checkType(val, structure, type);
                    case 'boolean' :
                        return structure === Boolean(val);
                    default :
                        return false;
                }
                return true;
            }
        ;

        DataType.prototype                                  = {
            type                                            : function (val){
                if( typeof val === 'undefined' ){
                    return this._type;
                }
                if( typeof val === 'string' ){
                    this._type                              = val;
                }else{
                    this._type                              = null;
                }
                return this;
            },
            default                                         : function (val){
                if( typeof val === 'undefined' ){
                    return this._default;
                }
                this._default                               = val;
                return this;
            },
            structure                                       : function (val){
                if( typeof val === 'undefined' ){
                    return this._structure;
                }
                if( typeof val === 'object' ){
                    this._structure                         = val;
                }
                return this;
            },
            check                                           : function (val){
                if( typeof val === 'undefined' ){
                    return this._check;
                }
                if( typeof val === 'function' ){
                    this._check                             = val;
                }
                return this;
            },
            regular                                         : function (val){
                if( typeof val === 'undefined' ){
                    return this._regular;
                }
                if( typeof val === 'string' ){
                    this._reg                               = new RegExp('^' + val + '$');
                    this._regular                           = val;
                }else{
                    this._reg                               = null;
                    this._regular                           = null;
                }
                return this;
            },
            parser                                          : function (val){
                if( typeof val === 'undefined' ){
                    return this._parser;
                }
                if( typeof val === 'function' ){
                    this._parser                            = val;
                }else{
                    this._parser                            = null;
                }
                return this;
            },
            stringifier                                     : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._stringifier;
                }
                if( type === 'function' ){
                    this._stringifier                       = val;
                }
                return this;
            },
            allowed                                         : function (val){
                if( typeof val === 'undefined' ){
                    return this._allowed;
                }
                if( val instanceof Array && val.length ){
                    this._allowed                           = val;
                }else{
                    this._allowed                           = null;
                }
                return this;
            },
            test                                            : function (val){
                var type                                    = typeof(val);
                if( (this._allowed && jQuery.inArray(val, this._allowed) > -1) ||
                    (this._type && this._type === type) ||
                    (this._structure && checkStructure(val, this._structure)) ||
                    (this._check && this._check(val, type))
                ){
                    return true;
                }
                if( this._reg && type === 'string' && val){
                    return this._reg.test(val);
                }
                return false;
            },
            checkStructure                                  : function (val){
                return this._structure && checkStructure(val, this._structure);
            },
            parse                                           : function (val){
                if( !this.test(val) ){
                    return null;
                }
                return this._parser && val !== null ? this._parser(val, typeof val) : val;
            },
            stringify                                       : function (val){
                var value                                   = this.parse(val);
                return stringify(this._stringifier && isSet(val) ? this._stringifier(value) : value);
            }
        };
    /* Data types */
        var makeType                                        = function (name){
                if( !list[name] ){
                    list[name]                              = new DataType();
                }
                return list[name];
            },
            numberReg                                       = "((?:\\+|\\-)?[0-9]+(\\.[0-9]+)?)",
            percentReg                                      = numberReg + "([\%]?)",
            degreeReg                                       = numberReg + "(?:deg)?",
            sizeReg                                         = numberReg + "((?:[\\%]?)|(?:px)?)"
        ;
        makeType('number')
            .type('number')
            .default(0)
            .regular(numberReg)
            .parser(function (value, type){
                if( type === 'number' ){
                    return value;
                }
                if( type === 'string' ){
                    var matches                             = this._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        return aRD.toNumber(matches[1], this._default);
                    }
                }
                return this._default;
            })
        ;
        makeType('percent')
            .type('number')
            .default(100)
            .regular(percentReg)
            .parser(function (value, type){
                if( type === 'number' ){
                    return value;
                }else if( type === 'string' ){
                    var matches                             = this._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        return aRD.toNumber(matches[1], this._default);
                    }
                }
                return this._default;
            })
            .stringifier(function (value){
                return value ? value + '%' : '';
            })
        ;
        makeType('degree')
            .type('number')
            .default(0)
            .regular(degreeReg)
            .parser(function (value, type){
                if( type === 'number' ){
                    return value;
                }else if( type === 'string' ){
                    var matches                             = this._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        return aRD.toNumber(matches[1], this._default);
                    }
                }
                return this._default;
            })
            .stringifier(function (value){
                return value ? value + 'deg' : '';
            })
        ;
        makeType('size')
            .type('number')
            .regular(sizeReg)
            .structure({
                properties                                  : {
                    value                                       : 'number',
                    type                                        : ['%', 'px']
                }
            })
            .parser(function (value, type){
                switch(type){
                    case 'number' :
                        return {
                            value                           : value,
                            type                            : 'px'
                        };
                    case 'string' :
                        var matches                         = this._reg.exec(value);
                        if( matches && matches.length > 1 ){
                            var ret                         = {
                                value                       : aRD.toNumber(matches[1], 0),
                                type                        : 'px'
                            };
                            if(matches.length > 3 && matches[3]){
                                ret.type                    = matches[3];
                            }
                            return ret;
                        }
                        break;
                    case 'object' :
                        if( this.checkStructure(value) ){
                            return {
                                value                       : value.value,
                                type                        : value.type
                            };
                        }
                        break;
                }
                return null;
            })
            .stringifier(function (val){
                return val && val.value ? val.value + val.type : '';
            })
        ;
        makeType('url')
            .regular('url\\([^\\(\\)]+\\)')
        ;

    /* Range data type */
        var RangeDataType                                   = function (type){
                this._dataType                              = makeType(type);
            },
            getRange                                        = function (val){
                var type                                    = typeof(val),
                    ret                                     = {},
                    tmp
                ;
                switch (type){
                    case 'string' :
                        tmp                                 = val.split(':');
                        if( tmp[0] ){
                            ret.from                        = tmp[0];
                        }
                        if(tmp.length > 1 && tmp[1]){
                            ret.to                          = tmp[1];
                        }
                        break;
                    case 'object' :
                        if(val.hasOwnProperty('from')){
                            ret.from                        = val.from;
                        }
                        if(val.hasOwnProperty('to')){
                            ret.to                          = val.to;
                        }
                        break;
                    default :
                        ret.from                            = val;
                        break;
                }
                return ret;
            }
        ;

        RangeDataType.prototype                             = {
            type                                            : function (val){
                if( typeof val === 'undefined' ){
                    return this._type;
                }
                if( typeof val === 'string' ){
                    this._type                              = val;
                }else{
                    this._type                              = null;
                }
                return this;
            },
            test                                            : function (val){
                var range                                   = getRange(val);
                return !!(
                    (!isSet(range.from) || this._dataType.test(range.from)) &&
                    (!isSet(range.to) || this._dataType.test(range.to))
                );
            },
            parse                                           : function (val){
                var range                                   = getRange(val);
                range.from                                  = range.hasOwnProperty('from') ? this._dataType.parse(range.from) : null;
                range.to                                    = range.hasOwnProperty('to') ? this._dataType.parse(range.to) : null;
                return range;
            },
            stringify                                       : function (val){
                var range                                   = getRange(val);
                range.from                                  = range.hasOwnProperty('from') ? this._dataType.stringify(range.from) : '';
                range.to                                    = range.hasOwnProperty('to') ? this._dataType.stringify(range.to) : '';
                return range.from + (range.to ? ':' + range.to : '');
            }
        };

    /* Range data types */
        var makeRangeType                                   = function (name, type){
                if( !list[name] ){
                    list[name]                              = new RangeDataType(type);
                }
                return list[name];
            }
        ;
        makeRangeType('range', 'number');
        makeRangeType('percentRange', 'percent');
        makeRangeType('degreeRange', 'degree');
        makeRangeType('sizeRange', 'size');

    /* Extend aRunD */
        aRD.type                                            = makeType;
        aRD.rangeType                                       = makeRangeType;
        aRD.hasType                                         = function (name) {
            return !!(name && typeof(name) === 'string' && !!list[name]);
        };
        aRD.checkType                                       = function (type, value){
            return aRD.hasType(type) ? list[type].test(value) : typeof value === type;
        };

        //Types checks, parsing
        aRD.types                                           = {};
        aRD.stringify                                       = stringify;
}));