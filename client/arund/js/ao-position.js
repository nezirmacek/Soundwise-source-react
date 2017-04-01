/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */

(function(aRD){
    var
        _globalPositions                            = ['window', 'document'],
        _isGlobalPosition                           = function(pos){
            return jQuery.inArray(pos, _globalPositions) > -1;
        },
        __getElPos                                  = function($el, pos, eSize, pSize, align, alignFn, eOffs, pFix){
            var _pos                                = pos ? pos : {
                    value                           : eOffs,
                    type                            : 'px',
                    align                           : align
                },
                val                                 = (pFix || 0) + (
                    alignFn && alignFn[_pos.align] ?
                        alignFn[_pos.align](_pos, eSize, pSize) :
                        __getEPO(_pos, eSize, pSize)
                    )
            ;
            return val;
        },
        __invPosFn                                  = function(pos, eSize, pSize){
            return pSize - eSize - __getEPO(pos, eSize, pSize);
        },
        __midPosFn                                  = function(pos, eSize, pSize){
            return (pSize - eSize) / 2 + __getEPO(pos, eSize, pSize);
        },
        __getEPO                                    = function(pos, eSize, pSize){
            return (pos.offset ? pos.offset / 100 * eSize : 0) + aRD.fixSizeValue(pos, pSize);
        },
        __getElXPos                                 = function($el, pos, pSize, eOffs, pFix, eSize){
            return __getElPos($el, pos, eSize || $el.outerWidth(true), pSize, 'left', {
                'right'                             : __invPosFn,
                'center'                            : __midPosFn
            }, eOffs, pFix);
        },
        __getElYPos                                 = function($el, pos, pSize, eOffs, pFix, eSize){
            return __getElPos($el, pos, eSize || $el.outerHeight(true), pSize, 'top', {
                'bottom'                            : __invPosFn,
                'middle'                            : __midPosFn,
            }, eOffs, pFix);
        },
        __getElPosWindowCss                         = function($el, posX, posY, pos, size){
            var ret                                 = {
                    position                        : 'absolute'
                },
                pSize                               = _getWindowSize(),
                $p                                  = $el.parent(),
                $w                                  = $p.is('.oa-window-fake-wrap') ? $p : aRD.$w,
                position                            = pos || $el.css('position'),
                needFix                             = position !== 'absolute',
                eSize                               = size || {},
                scLeft                              = $w.scrollLeft(),
                scTop                               = $w.scrollTop(),
                offs, eOffs
            ;
            if( posX || needFix ){
                if( !posX ){
                    offs                            = $el.offset();
                    eOffs                           = offs.left - scLeft;
                }
                ret.left                            = __getElXPos($el, posX, pSize.width, eOffs, 0, eSize.width);
            }
            if( posY || needFix ){
                if( !posY ){
                    offs                            = offs || $el.offset();
                    eOffs                           = offs.top - scTop;
                }
                ret.top                             = __getElYPos($el, posY, pSize.height, eOffs, 0, eSize.height);
            }
            return ret;
        },
        __getElPosDocumentCss                       = function($el, posX, posY, pos, size){
            var ret                                 = {
                    position                        : 'absolute'
                },
                pSize                               = _getContentSize(),
                eSize                               = size || {},
                offs                                = posX && posY ? {} : $el.offset()
            ;
            ret.left                                = __getElXPos($el, posX, pSize.width, offs.left, 0, eSize.width);
            ret.top                                 = __getElYPos($el, posY, pSize.height, offs.top, 0, eSize.height);
            return ret;
        },
        __getElPosFixedCss                          = function($el, posX, posY, pos, size){
            var ret                                 = {
                    position                        : 'fixed'
                },
                pSize                               = _getWindowSize(),
                position                            = pos || $el.css('position'),
                needFix                             = position !== 'fixed',
                eSize                               = size || {},
                offs, eOffsLeft, eOffsTop
            ;
            if( posX || needFix ){
                if( !posX ){
                    offs                            = $el.offset();
                    eOffsLeft                       = offs.left - aRD.$w.scrollLeft();
                }
                ret.left                            = __getElXPos($el, posX, pSize.width, eOffsLeft, 0, eSize.width);
            }
            if( posY || needFix ){
                if( !posY ){
                    offs                            = offs || $el.offset();
                    eOffsTop                        = offs.top - aRD.$w.scrollTop();
                }
                ret.top                             = __getElYPos($el, posY, pSize.height, eOffsTop, 0, eSize.height);
            }
            return ret;
        },
        __getElPosAbsoluteCss                       = function($el, posX, posY, pos, size){
            var ret                                 = {
                    position                        : 'absolute'
                },
                $p                                  = _getOffsetParrent($el),
                pSize                               = _getParrentSize($el, 'absolute', $p),
                position                            = pos || $el.css('position'),
                needFix                             = position === 'fixed' || position === 'static',
                eSize                               = size || {},
                offs, pOffs, eOffsLeft, eOffsTop
            ;
            if( posX || needFix ){
                if( !posX ){
                    if( position === 'fixed' ){
                        offs                        = $el.offset();
                        pOffs                       = $p.offset();
                        eOffsLeft                   = offs.left - pOffs.left;
                    }else if( position === 'static' ){
                        offs                        = $el.position();
                        eOffsLeft                   = offs.left;
                    }
                }
                ret.left                            = __getElXPos($el, posX, pSize.width, eOffsLeft, 0, eSize.width);
            }
            if( posY || needFix ){
                if( !posY ){
                    if( position === 'fixed' ){
                        offs                        = offs || $el.offset();
                        pOffs                       = pOffs || $p.offset();
                        eOffsTop                    = offs.top - pOffs.top;
                    }else if( position === 'static' ){
                        offs                        = offs || $el.position();
                        eOffsTop                    = offs.top;
                    }
                }
                ret.top                             = __getElYPos($el, posY, pSize.height, eOffsTop, 0, eSize.height);
            }
            return ret;
        },
        __getElPosRelativeCss                       = function($el, posX, posY, pos, size){
            var ret                                 = {
                    position                        : 'relative'
                },
                $p                                  = $el.parent(),
                pSize                               = _getParrentSize($el, 'relative', $p),
                position                            = pos || $el.css('position'),
                needFix                             = position !== pos,
                eSize                               = size || {},
                offs                                = {}
            ;
            if( !(posX || posY) && needFix ){
                offs                                = _getRelativePosition($el, posX, posY);
            }
            if( posX || needFix ){
                ret.left                            = __getElXPos($el, posX, pSize.width, offs.left, 0, eSize.width);
            }
            if( posY || needFix ){
                ret.top                             = __getElYPos($el, posY, pSize.height, offs.top, 0, eSize.height);
            }
            return ret;
        },
        __invFixFn                                  = function(pos, pSize){
            if( pos.type === '%' ){
                pos.value                           = 100 - (pos.value || 0);
            }else{
                pos.value                           = pSize - (pos.value || 0);
            }
            pos.offset                              = -(pos.offset || 0) - 100;
        },
        __midFixFn                                  = function(pos, pSize){
            if( pos.type === '%' ){
                pos.value                           += 50;
            }else{
                pos.value                           += pSize/2;
            }
            pos.offset                              = (pos.offset || 0) - 50;
        },
        __fixToPos                                  = function(to, pSize, pos, fn, align){
            if( to.align !== align ){
                if( fn[to.align] ){
                    fn[to.align](to, pSize);
                }
                to.align                            = align;
            }
            if( pos && to.type !== pos.type ){
                if( pos.type === '%' ){
                    pos.value                       = pSize * pos.value / 100;
                }else{
                    pos.value                       = pos.value / pSize * 100;
                }
                pos.type                            = to.type;
            }
            return to;
        },
        __fixToXPos                                 = function(to, pSize, pos){
            return __fixToPos(jQuery.extend({}, to), pSize, pos, {
                'right'                             : __invFixFn,
                'center'                            : __midFixFn,
            }, 'left');
        },
        __fixToYPos                                 = function(to, pSize, pos){
            return __fixToPos(jQuery.extend({}, to), pSize, pos, {
                'bottom'                            : __invFixFn,
                'middle'                            : __midFixFn,
            }, 'top');
        },
        _getFixedPosition                           = function($el, noX, noY){
            var offs                                = $el.offset();
            if( !noX ){
                offs.left                           = offs.left - aRD.$w.scrollLeft();
            }
            if( !noY ){
                offs.top                            = offs.top - aRD.$w.scrollTop();
            }
            return offs;
        },
        _createFakeEl                               = function($el, css){
            return jQuery('<span/>').css(jQuery.extend({
                width                               : 0,
                height                              : 0,
                display                             : 'inline-block'
            }, css || {})).insertBefore($el);
        },
        _getRelativePosition                        = function($el, noX, noY){
            var offs                                = {};
            if( !noX ){
                offs.left                           = parseInt($el.css('left')) || 0;
            }
            if( !noY ){
                offs.top                            = parseInt($el.css('top')) || 0;
            }
            return offs;
        },
        _getOffsetParrent                           = function($el){
            if( $el.css('display') !== 'none' && $el.css('position') === 'absolute' ){
                return jQuery($el[0].offsetParent);
            }else{
                var $tmp                            = _createFakeEl($el, {position: 'absolute'}),
                    $p                              = jQuery($tmp[0].offsetParent)
                ;
                $tmp.remove();
                return $p;
            }
        },
        _getParrentSize                             = function($el, _position, $_p){
            var size, $p;
            switch(_position || $el.css('position')){
                case 'window':
                case 'fixed':
                    size                            = _getWindowSize();
                    break;
                case 'document':
                    size                            = _getContentSize();
                    break;
                case 'absolute':
                    $p                              = $_p || _getOffsetParrent($el);
                    size                            = {
                        width                       : $p.innerWidth(),
                        height                      : $p.innerHeight()
                    };
                    break;
                default:
                    $p                              = $_p || $el.parent();
                    size                            = {
                        width                       : $p.width(),
                        height                      : $p.height()
                    };
                    break;
            }
            return size;
        },
        __fixPos                                    = function($el, posX, posY, _position, _pos, toX, toY){
            var ret                                 = {},
                position                            = _position,
                offs, pSize
            ;
            if( !(posX && posY) ){
                if( $el.css('display') === 'none' && jQuery.inArray(_position, ['document', 'absolute']) > -1 ){
                    offs                            = {
                        top                         : 0,
                        left                        : 0
                    };
                }else{
                    switch(_position){
                        case 'window':
                            if( $el.parent().is('.oa-window-fake-wrap') ){
                                offs                = {
                                    'top'           : parseInt($el.css('top')),
                                    'left'          : parseInt($el.css('left'))
                                };
                            }else{
                                offs                = _getFixedPosition($el, posX, posY);
                            }
                            break;
                        case 'document':
                            offs                    = $el.css('display') === 'none' ? {
                                top                 : 0,
                                left                : 0
                            } : $el.offset();
                            break;
                        case 'fixed':
                            if(_pos === 'fixed'){
                                offs                = _getFixedPosition($el, posX, posY);
                            }else{
                                if( $el.css('display') === 'none' ){
                                    offs            = {
                                        top         : 0,
                                        left        : 0
                                    };
                                }else{
                                    position        = 'window';
                                    offs            = $el.offset();
                                    offs.top        -= aRD.$w.scrollTop();
                                    offs.left       -= aRD.$w.scrollLeft();
                                }
                            }
                            break;
                        case 'absolute':
                            offs                    = {
                                'top'               : parseInt($el.css('top')),
                                'left'              : parseInt($el.css('left'))
                            };
                            break;
                        case 'relative':
                            offs                    = _getRelativePosition($el, posX, posY);
                            break;
                    }
                }
                
            }
            pSize                                   = _getParrentSize($el, _position);
            
            ret.position                            = position;
            ret.posX                                = posX ? __fixToXPos(posX, pSize.width) :
                {
                    'align'                         : 'left',
                    'value'                         : offs.left,
                    'type'                          : 'px'
                }
            ;
            ret.posY                                = posY ? __fixToYPos(posY, pSize.height) :
                {
                    'align'                         : 'top',
                    'value'                         : offs.top,
                    'type'                          : 'px'
                }
            ;
            if( toX ){
                ret.toX                             = __fixToXPos(toX, pSize.width, ret.posX);
            }
            if( toY ){
                ret.toY                             = __fixToYPos(toY, pSize.height, ret.posY);
            }
            return ret;
        },
        _normalizePosition                          = function(pos){
            if( !pos ){
                return;
            }
            if( !pos.value ){
                pos.value                           = 0;
            }
            if( !pos.offset ){
                pos.offset                          = 0;
            }
        },
        __convertPosition                           = function($el, posX, posY, position, toX, toY){
            var _pos                                = $el.css('position'),
                _position                           = position || _pos,
                ret                                 = {}
            ;
            ret                                     = __fixPos($el, posX, posY, _position, _pos, toX, toY);
            _normalizePosition(ret.posX);
            _normalizePosition(ret.posY);
            _normalizePosition(ret.toX);
            _normalizePosition(ret.toY);
            return ret;
        },
        _getPositionCss                             = function($el, posX, posY, position, size){
            var pos                                 = $el.data('ao__position') || $el.css('position'),
                _position                           = position || pos,
                ret
            ;
            //if nothing should be changed exit
            if( !(posX || posY) && pos === _position ){
                return null;
            }
            switch(_position){
                case 'window':
                    ret                             = __getElPosWindowCss($el, posX, posY, pos, size);
                    break;
                case 'document':
                    ret                             = __getElPosDocumentCss($el, posX, posY, pos, size);
                    break;
                case 'fixed':
                    ret                             = __getElPosFixedCss($el, posX, posY, pos, size);
                    break;
                case 'absolute':
                    ret                             = __getElPosAbsoluteCss($el, posX, posY, pos, size);
                    break;
                case 'relative':
                    ret                             = __getElPosRelativeCss($el, posX, posY, pos, size);
                    break;
            }
            
            return ret;
        },
        _getPositionStyle                           = function($el, posX, posY, position){
            var pos                                 = $el.data('ao__position') || $el.css('position'),
                _position                           = position || pos,
                ret
            ;
            //if nothing should be changed exit
            if( !(posX || posY) && pos === _position ){
                return null;
            }
            switch(_position){
                case 'window':
                case 'document':
                case 'absolute':
                    ret                             = {
                        position                    : 'absolute'
                    };
                    break;
                case 'fixed':
                    ret                             = {
                        position                    : 'fixed'
                    };
                    break;
                case 'relative':
                    ret                             = {
                        position                    : 'relative'
                    };
                    break;
            }
            
            return ret;
        },
        _getWindowSizePartCss                      = function(pWidth, pHeight, names){
            var size                                = aRD.getWindowSize(),
                css                                 = {},
                _names                              = names || {}
            ;
            if( pWidth ){
                css[_names.width || 'width']        = size.width * pWidth;
            }
            if( pHeight ){
                css[_names.height || 'height']      = size.height * pHeight;
            }
            return css;
        },
        _getContentSizePartCss                     = function(pWidth, pHeight){
            var size                                = aRD.getContentSize(),
                css                                 = {}
            ;
            if( pWidth ){
                css.width                           = size.width * pWidth;
            }
            if( pHeight ){
                css.height                          = size.height * pHeight;
            }
            return css;
        },
        __regNOE                                    = "(?=$|(?:\\+|\\-)[0-9])",
        __getAtPositionReg                           = function(allowed){
            var escReg                              = [];
            if( allowed && allowed.length ){
                for (var i = 0; i < allowed.length; i++) {
                    escReg.push("(?:" + aRD.escapeRegExp(allowed[i]) + ")");
                }
            }
            return new RegExp(
                "^(?:(" + escReg.join('|') + ")" + __regNOE + "){0,1}" +
                "(?:" + aRD.types.size.regStr + __regNOE + "){0,1}" +
                "(?:(" + aRD.types.number.regStr + ")(?:[\\#])){0,1}$"
            );
        },
        __TPositionParse                             = function(value, reg){
            var type                                = typeof(value),
                ret                                 = {
                    value                           : 0,
                    type                            : 'px'
                }
            ;
            if( type === 'number' ){
                ret.value                           = value;
            }else if( type === 'string' ){
                var matches                         = reg.exec(value);
                if( matches ){
                    if( matches[2] ){
                        ret.value                   = aRD.toNumber(matches[2], ret);
                    }
                    if( matches[4] ){
                        ret.type                    = matches[4];
                    }
                    if( matches[1] ){
                        ret.align                   = matches[1];
                    }
                    if( matches[5] ){
                        ret.offset                  = aRD.toNumber(matches[5], 0);
                    }
                }
            }
            return ret;
        },
        __TPositionX                                 = {
            _allowed                                : ['left', 'center', 'right'],
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && type && __TPositionX._reg.test(value) );
            },
            parse                                   : function(value){
                return __TPositionParse(value, __TPositionX._reg);
            }
        },
        __TPositionY                                 = {
            _allowed                                : ['top', 'middle', 'bottom'],
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && type && __TPositionY._reg.test(value) );
            },
            parse                                   : function(value){
                return __TPositionParse(value, __TPositionY._reg);
            }                                
        },
        __setWindowSize                             = function(){
            var width                               = aRD.$w.width(),
                height                              = aRD.$w.height(),
                t                                   = aRD.$w.data('ao_windowresize_timeout')
            ;
            if( t ){
                clearTimeout(t);
            }
            if( !_windowSize || _windowSize.width !== width || _windowSize.height !== height ){
                _windowSize                         = {
                    width                           : width,
                    height                          : height
                };
                var fn                              = function(){
                        _setContentSize();
                        _runResize();
                        var _f                      = aRD.$w.data('aoWindowResizeFunc');
                        if( _f ){
                            for (var i = 0; i < _f.length; i++) {
                                _f[i].fn.apply(_f[i].el, []);
                            }
                        }
                    }
                ;
                fn();
                //set timeout to recheck it after all functions is done, to fix scroll bar bugs
                aRD.$w.data('ao_windowresize_timeout', setTimeout(__setWindowSize, 100));
            }
            return _windowSize;
        },
        _getWindowSize                             = function(){
            if( !_windowSize ){
                __setWindowSize();
            }
            return _windowSize;
        },
        _setContentSize                             = function(){
            var body                                = jQuery('body')[0],
                wSize                               = _getWindowSize(),
                width                               = Math.max(wSize.width, body.scrollWidth),
                height                              = Math.max(wSize.height, body.scrollHeight)
            ;
            if( !_contentSize || _contentSize.width !== width || _contentSize.height !== height ){
                _contentSize                        = {
                    width                           : width,
                    height                          : height
                };
                _runResize();
                var _f                              = aRD.$w.data('aoContentResizeFunc');
                if( _f ){
                    for (var i = 0; i < _f.length; i++) {
                        _f[i].fn.apply(_f[i].el, []);
                    }
                }
            }
        },
        _getContentSize                             = function(){
            if( !_contentSize ){
                _setContentSize();
            }
            return _contentSize;
        },
        _runPositionWatch                           = function($el){
            jQuery.each(_positionWatch, function(i, fn){
                fn($el);
            });
        },
        _runResize                                  = function(){
            var t                                   = aRD.$w.data('ao_runresize_timeout');
            if( t ){
                clearTimeout(t);
            }
            aRD.$w.data('ao_runresize_timeout', setTimeout(function(){
                jQuery('[data-ao-animaze-resize]').aoAnimaze('resize');
                var _f                              = aRD.$w.data('aoResizeFunc');
                if( _f ){
                    for (var i = 0; i < _f.length; i++) {
                        _f[i].fn.apply(_f[i].el, []);
                    }
                }
                aRD.$w.data('ao_runresize_timeout', null);
            }));
        },
        _windowParrent                              = 'body',
        _positionWatch                              = {},
        _windowSize, _contentSize
    ;
    __TPositionX._reg                               = __getAtPositionReg(__TPositionX._allowed);
    __TPositionY._reg                               = __getAtPositionReg(__TPositionY._allowed);

    aRD.getWindowSize                               = _getWindowSize;
    aRD.getWindowSizePartCss                        = _getWindowSizePartCss;
    aRD.setContentSize                              = _setContentSize;
    aRD.getContentSize                              = _getContentSize;
    aRD.getContentSizePartCss                       = _getContentSizePartCss;
    aRD.getPositionCSS                              = _getPositionCss;
    aRD.convertPosition                             = __convertPosition;
    aRD.normalizePosition                           = _normalizePosition;
    aRD.positionWatch                               = _positionWatch;
    aRD.getOffsetParrent                            = _getOffsetParrent;
    aRD.getParrentSize                              = _getParrentSize;
    aRD.runResize                                   = _runResize;

    aRD.addStyling(['position', 'x', 'y'], function($el, css, styles){
        var x, y, pos, setPos;
        if( typeof(styles.x) !== 'undefined' ){
            x                                       = styles.x;
            delete styles.x;
        }
        if( typeof(styles.y) !== 'undefined' ){
            y                                       = styles.y;
            delete styles.y;
        }
        if( typeof(styles.top) !== 'undefined' || typeof(styles.left) !== 'undefined' ){
            return;
        }
        if( typeof(styles.position) !== 'undefined' ){
            setPos                                  = true;
            pos                                     = styles.position;
            delete styles.position;
            var _pos                                = $el.data('ao__position');
            if( _pos !== pos ){
                var $p;
                if( _isGlobalPosition(pos) ){
                    $el.data('ao__position', pos);
                    if( !$el.data('ao__tmpparent') ){
                        if( !$el.data('ao__replacer') ){
                            $el.data('ao__replacer', jQuery('<div style="display:none;"></div>').insertBefore($el));
                        }
                        if( pos === 'window' ){
                            var size                = aRD.getWindowSize();
                            $p                      = jQuery('<div/>').css({
                                    'position'          : 'absolute',
                                    'top'               : aRD.$w.scrollTop(),
                                    'left'              : aRD.$w.scrollLeft(),
                                    'width'             : size.width,
                                    'height'            : size.height,
                                })
                                .addClass('oa-window-fake-wrap')
                                .appendTo(_windowParrent)
                                .append($el)
                                .on('aoresize', function(){
                                    var $this       = jQuery(this),
                                        offs        = $this.offset(),
                                        width       = parseInt($this.css('width')),
                                        height      = parseInt($this.css('height')),
                                        wSize       = aRD.getWindowSize(),
                                        cSize       = aRD.getContentSize(),
                                        css         = {
                                            height      : wSize.height,
                                            width       : wSize.width
                                        }
                                    ;
                                    if( (offs.top + height) > cSize.height ){
                                        css.top     = cSize.height - wSize.height;
                                    }
                                    if( (offs.left + width) > cSize.width ){
                                        css.left    = cSize.width - wSize.width;
                                    }
                                    $this.css(css);
                                })
                            ;
                            $el.data('ao__tmpparent', $p);
                        }else{
                            $el.data('ao__tmpparent', _windowParrent);
                            $el.appendTo(_windowParrent);
                        }
                        _runPositionWatch($el);
                    }
                }else if( _isGlobalPosition(_pos) ){
                    var $rep                            = $el.data('ao__replacer');
                    $p                                  = $el.data('ao__tmpparent');
                    if( $rep && $rep.length ){
                        $el.data('ao__replacer', null).insertBefore($rep);
                        $rep.remove();
                        $rep                            = null;
                        _runPositionWatch($el);
                    }
                    if( $p && $p.is('.oa-window-fake-wrap') ){
                        $p.remove();
                    }
                    $p                                  = null;
                    $el.data('ao__tmpparent', null);
                }
                $el.data('ao__position', pos);
            }
        }
        if( x || y || _isGlobalPosition(pos) ){
            var style                                   = _getPositionStyle($el, x, y, pos);
            if( style ){
                jQuery.extend(css, style);
                styles.onComplete.push(function(){
                    $el.css( _getPositionCss($el, x, y, pos) );
                });
            }
        }else if(setPos){
            css.position                                = pos;
        }
    });

    jQuery(function(){
        aRD.$w.off('.aoSetSizes')
            .on('resize.aoSetSizes aoSetSizes.aoSetSizes', function(){
                var t                                   = aRD.$w.data('ao_windowresize_timeout');
                if( t ){
                    clearTimeout(t);
                }
                aRD.$w.data('ao_windowresize_timeout', setTimeout(function(){
                    __setWindowSize();
                }, 50));
            })
        ;
        if( jQuery('.ao-window-fake').length ){
            _windowParrent                              = jQuery('.ao-window-fake').first();
        }
    });

    jQuery.extend(aRD.types, {
        positionX                                   : __TPositionX,
        positionY                                   : __TPositionY
    });
    jQuery.extend(aRD.checks, {
        position                                    : {
            name                                        : 'position',
            type                                        : 'string',
            allowed                                     : ['absolute', 'fixed', 'relative']
        },
        absposition                                 : {
            name                                        : 'position',
            type                                        : 'string',
            allowed                                     : ['absolute', 'fixed', 'window', 'document', 'relative']
        }
    });
    
    jQuery.event.special.windowresize                   = {
        add                                             : function(o){
            if (o.handler) {
                var
                    $w                                  = aRD.$w,
                    funcs                               = $w.data('aoWindowResizeFunc') || [],
                    obj                                 = {
                        id                              : o.guid,
                        fn                              : o.handler,
                        el                              : this
                    }
                ;
                if( o.data && o.data.unshift ){
                    funcs.unshift(obj);
                }else{
                    funcs.push(obj);
                }
                
                $w.data('aoWindowResizeFunc', funcs );
                if( !$w.data('aoHasWindowResizeFunc') ){
                    $w.data('aoHasWindowResizeFunc', true);
                }
            }
        },
        remove                                          : function(o) {
            if (o.handler) {
                var funcs                               = aRD.$w.data('aoWindowResizeFunc');
                if( funcs ){
                    for (var i = 0; i < funcs.length; i++) {
                        if( funcs[i].id === o.guid ){
                            funcs.splice(i, 1);
                        }
                    }

                    if( !funcs.length ){
                        aRD.$w.data('aoHasWindowResizeFunc', false);
                        funcs                           = null;
                    }
                }
                aRD.$w.data('aoWindowResizeFunc', funcs );
            }
        }
    };
    jQuery.event.special.contentresize                  = {
        add                                             : function(o){
            if (o.handler) {
                var
                    $w                                  = aRD.$w,
                    funcs                               = $w.data('aoContentResizeFunc') || [],
                    obj                                 = {
                        id                              : o.guid,
                        fn                              : o.handler,
                        el                              : this
                    }
                ;
                if( o.data && o.data.unshift ){
                    funcs.unshift(obj);
                }else{
                    funcs.push(obj);
                }
                
                $w.data('aoContentResizeFunc', funcs );
                if( !$w.data('aoHasContentResizeFunc') ){
                    $w.data('aoHasContentResizeFunc', true);
                }
            }
        },
        remove                                          : function(o) {
            if (o.handler) {
                var funcs                               = aRD.$w.data('aoContentResizeFunc');
                if( funcs ){
                    for (var i = 0; i < funcs.length; i++) {
                        if( funcs[i].id === o.guid ){
                            funcs.splice(i, 1);
                        }
                    }

                    if( !funcs.length ){
                        aRD.$w.data('aoHasContentResizeFunc', false);
                        funcs                           = null;
                    }
                }
                aRD.$w.data('aoContentResizeFunc', funcs );
            }
        }
    };
    jQuery.event.special.aoresize                       = {
        add                                             : function(o){
            if (o.handler) {
                var
                    $w                                  = aRD.$w,
                    funcs                               = $w.data('aoResizeFunc') || [],
                    obj                                 = {
                        id                              : o.guid,
                        fn                              : o.handler,
                        el                              : this
                    }
                ;
                if( o.data && o.data.unshift ){
                    funcs.unshift(obj);
                }else{
                    funcs.push(obj);
                }
                
                $w.data('aoResizeFunc', funcs );
                if( !$w.data('aoHasResizeFunc') ){
                    $w.data('aoHasResizeFunc', true);
                }
            }
        },
        remove                                          : function(o) {
            if (o.handler) {
                var funcs                               = aRD.$w.data('aoResizeFunc');
                if( funcs ){
                    for (var i = 0; i < funcs.length; i++) {
                        if( funcs[i].id === o.guid ){
                            funcs.splice(i, 1);
                        }
                    }

                    if( !funcs.length ){
                        aRD.$w.data('aoHasResizeFunc', false);
                        funcs                           = null;
                    }
                }
                aRD.$w.data('aoResizeFunc', funcs );
            }
        }
    };
})(aRunD);