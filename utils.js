/**
 * 常用工具函数
 * Created by Grayson Rex on 2015/6/17.
 */
(function (window) {

    var utils = window.utils = {};

    /* AJAX函数 ST */
    (function () {
        /**
         * 发送一个ajax请求
         * @param _param.url        请求的地址
         * @param _param.type       请求类型（GET/POST，默认为GET）
         * @param _param.data       发送的表单数据
         * @param _param.async      是否异步（默认为true）
         * @param _param.success    请求成功返回数据时的回调，接受一个res（回复的json数据）参数
         * @param _param.error      请求异常返回数据时的回调，接受一个状态码，可能会有一个res参数和ex异常参数
         *
         * 简单参数模式时，参数顺序请按以下顺序排列：
         *  utils.ajax(url[, type][, data][, async], success[, error]);
         */
        var ajax = function (_param) {
            var _this = {};
            var param = convertArgs(_param);

            var xhr = ajax.createXHR();
            xhr.async = param.async;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        // 请求成功
                        var res = xhr.responseText;
                        try {
                            res = JSON.parse(res);
                            param.success.call(_this, res);
                        } catch (ex) {
                            param.error.call(_this, -2, res, ex);
                        }
                    } else {
                        // 请求不成功
                        param.error.call(_this, xhr.status, null);
                    }
                }
            };

            // 加上时间参数，可供服务器验证和排除缓存
            var url = param.url + '?t=' + String(new Date().getTime());
            var data = ajax.encodeArguments(param.data);
            _this.trueUrl = url;
            _this.trueData = data;

            try {
                if (param.type.toLocaleLowerCase() == 'get') {
                    // GET型请求时，参数编码后拼入URL中
                    url = data ? url + '&' + data : url;
                    _this.trueUrl = url;
                    xhr.open('GET', url, true);
                    xhr.send();
                } else if (param.type.toLocaleLowerCase() == 'post') {
                    // POST型请求时，设置Content-Type后，将编码后参数在请求体内发送
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.send(data);
                }
            } catch (ex) {
                param.error(-1, ex);
            }
        };
        ajax.createXHR = function () {
            var xhr = null;
            if (window.XMLHttpRequest) { // Mozilla, Safari,...
                xhr = new XMLHttpRequest();
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType('text/xml');
                }
            } else if (window.ActiveXObject) { // IE
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {
                    }
                }
            }
            if (!xhr) {
                throw '无法创建XMLHttpRequest对象';
                return false;
            }
            return xhr;
        };
        ajax.encodeArguments = function (data) {
            var tmp = [];
            if (data) {
                for (var key in data) {
                    var value = data[key];
                    if (typeof(value) != 'string') {
                        value = JSON.stringify(value);
                    }
                    tmp.push(key + '=' + encodeURIComponent(value));
                }
            }
            return tmp.join('&');
        };

        utils.ajax = ajax;
    })();

    var DEFAULT = {
        url: '/action/',
        type: 'get'
    };
    var convertArgs = function (args) {
        var param = {
            url: DEFAULT.url,
            type: DEFAULT.type,
            data: {},
            async: true,
            success: function () {
            },
            error: function () {
            }
        }, _param = null;
        if (typeof(args) == 'object') {
            _param = args;
            for (var i in  _param) {
                param[i] = _param[i];
            }
        } else {
            var _args = Array.prototype.slice.call(arguments, 0);
            var _prop = ['url', 'type', 'data', 'async', 'success', 'error'],
                _type = ['string', 'string', 'object', 'boolean', 'function', 'function'];
            for (var i = 0, p, t; (p = _prop[i]) && (t = _type[i]); i++) {
                if (typeof(_args[0]) == t) {
                    param[p] = _args.splice(0, 1)[0];
                }
            }
        }
        return param;
    };
    /* AJAX函数 ED */

})(window);