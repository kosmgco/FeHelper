/**
 * FeHelper Settings Tools
 */
module.exports = (() => {

    // 页面json格式化强制开启
    let MSG_TYPE = Tarp.require('../static/js/msg_type');

    // 默认值：JSON格式化支持的最大key数量
    let maxJsonKeysNumber = 10000;

    // 所有配置项
    let optionItems = [
        'opt_item_contextMenus',
        'JSON_PAGE_FORMAT',
        'CODE_BEAUTIFY',
        'CODE_COMPRESS',
        'JSON_FORMAT',
        'JSON_COMPARE',
        'FCP_HELPER_DETECT',
        'JS_CSS_PAGE_BEAUTIFY',
        'FORBID_OPEN_IN_NEW_TAB',
        'MAX_JSON_KEYS_NUMBER',
        'AUTO_TEXT_DECODE',
    ];

    // 默认处理关闭状态的功能，除非用户手动打开
    let offDefaultList = [
    ];

    // 邮件菜单配置项
    let menuOptions = {
        MENU_PAGE_ENCODING: {
            icon: '↺',
            text: '网页编码设置'
        },
        MENU_STR_ENDECODE: {
            icon: '♨',
            text: '字符串编解码',
            contexts: ['page', 'selection', 'editable']
        },
        MENU_JSON_FORMAT: {
            icon: '★',
            text: 'JSON格式化',
            contexts: ['page', 'selection', 'editable']
        },
        MENU_JSON_COMPARE: {
            icon: '☃',
            text: 'JSON比对器'
        },
        MENU_CODE_FORMAT: {
            icon: '☂',
            text: '代码美化工具',
            contexts: ['page', 'selection', 'editable']
        },
        MENU_CODE_COMPRESS: {
            icon: '〓',
            text: '代码压缩工具'
        },
        MENU_DOWNLOAD_CRX: {
            icon:'↬',
            text: '下载/分享插件'
        }
    };

    /**
     * 获取全部配置项
     * @returns {string[]}
     * @private
     */
    let _getAllOpts = () => optionItems.concat(Object.keys(menuOptions));


    /**
     * 向background-page发送请求，提取配置项
     * @param {Function} callback 回调方法
     */
    let _getOptions = function (callback) {
        chrome.runtime.sendMessage({
            type: MSG_TYPE.GET_OPTIONS
        }, callback);
    };

    /**
     * 向background-page发送请求，保存配置项
     * @param {Object} items
     */
    let _setOptions = function (items) {
        chrome.runtime.sendMessage({
            type: MSG_TYPE.SET_OPTIONS,
            items: items
        });
    };

    /**
     * 由background-page触发
     * @param {Object} callback
     */
    let _getOptsFromBgPage = function (callback) {
        if (callback && typeof callback === 'function') {
            let rst = {};
            _getAllOpts().forEach((item) => {
                let opt = localStorage.getItem(item);
                if (item === 'MAX_JSON_KEYS_NUMBER') {
                    rst[item] = opt || maxJsonKeysNumber;
                } else if (typeof(opt) === 'number') {
                    rst[item] = opt;
                } else if (opt !== 'false') {
                    if(opt || !offDefaultList.includes(item)) {
                        rst[item] = 'true';
                    }
                }
            });
            callback.call(null, rst);
        }
    };

    /**
     * 由background-page触发
     * @param {Object} items
     */
    let _setOptsFromBgPage = function (items) {

        _getAllOpts().forEach((opt) => {
            let found = items.some(it => {
                if (typeof(it) === 'string' && it === opt) {
                    localStorage.setItem(opt, 'true');
                    return true;
                }
                else if (typeof(it) === 'object' && it.hasOwnProperty(opt)) {
                    localStorage.setItem(opt, it[opt]);
                    return true;
                }
                return false;
            });
            if (!found) {
                localStorage.setItem(opt, 'false');
            }
        });
    };

    /**
     * 获取菜单配置项
     */
    let _getMenuOpts = function () {
        return menuOptions;
    };

    /**
     * 询问一下，菜单是否已保存
     * @param callback
     * @private
     */
    let _askMenuSavedOrNot = function (callback) {
        chrome.runtime.sendMessage({
            type: MSG_TYPE.MENU_SAVED
        }, callback);
    };

    /**
     * 判断menu是否已经设置过了，判断方法是：
     * 随便挑选一个Menu项，看它是否在localStorage中被存储过了
     * @private
     */
    let _didMenuSettingSaved = function (callback) {
        let flag = !!localStorage.getItem('MENU_PAGE_ENCODING');
        if (callback && typeof callback === 'function') {
            callback(flag);
        } else {
            return flag;
        }
    };

    /**
     * 默认的菜单列表
     * @returns {string[]}
     * @private
     */
    let _getDefaultContextMenus = function () {
        return [
            'MENU_PAGE_ENCODING',
            'MENU_QRCODE_CREATE',
            'MENU_QRCODE_DECODE',
            'MENU_PAGE_CAPTURE',
            'MENU_COLOR_PICKER',
            'MENU_IMAGE_BASE64',
            'MENU_STR_ENDECODE',
            'MENU_JSON_FORMAT',
            'MENU_CODE_FORMAT'
        ];
    };

    return {
        getAllOpts: _getAllOpts,
        setOptsFromBgPage: _setOptsFromBgPage,
        getOptsFromBgPage: _getOptsFromBgPage,
        getOptions: _getOptions,
        setOptions: _setOptions,
        getMenuOpts: _getMenuOpts,
        didMenuSettingSaved: _didMenuSettingSaved,
        getDefaultContextMenus: _getDefaultContextMenus,
        askMenuSavedOrNot: _askMenuSavedOrNot
    };
})();
