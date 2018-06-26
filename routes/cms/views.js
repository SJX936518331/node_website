var express = require('express');
var util = require('util');
var fs = require('fs');
var formidable = require('formidable');
var crypto = require('crypto');
var router = express.Router();
require('../core/CommonUtil');
require('../core/HttpWrapper');
require('../core/SqlClient');
require('../model/model');
router.get('/', function (req, res, next) {
    // console.log(process.execPath);
    // console.log(__dirname);
    // console.log(process.cwd());
    res.redirect('/cms/index');
});

router.get('/index', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (website) {
        if (user) {
            res.render('cms/index', { user: user, website: website });
        } else {
            res.redirect('/cms/login');
        }
    } else {
        var sqlClient = new SqlClient();
        website = new Website();
        sqlClient.query(website, function (result) {
            if (result != null && result.length > 0) {
                website = result[0];
                req.session.website = website;
                if (user) {
                    res.render('cms/index', { user: user, website: website });
                } else {
                    res.redirect('/cms/login');
                }
                return;
            }
            res.redirect('/cms/logout');
        });
    }
});

router.get('/login', function (req, res, next) {
    res.render('cms/login', { username: '' });
});

router.get('/logout', function (req, res, next) {
    //清空user信息
    req.session.user = null;
    req.session.website = null;
    res.redirect('/cms/login');
});

router.post('/login', function (req, res, next) {
    var sqlClient = new SqlClient();
    var user = new User();

    sqlClient.query(user, function (result) {
        if (result != null && result.length > 0) {
            user = result[0];
            // 密码加密
            var md5 = crypto.createHash('md5');
            md5.update(req.body.password);
            var md5pwd = md5.digest('hex');

            console.log("# pwd          : " + req.body.password);
            console.log("# pwd_encoding : " + md5pwd);
            if (user.password != req.body.password) {
                res.render('cms/login', { status: 2, msg: '密码错误!', username: req.body.username });
                return;
            }
            if (user.createtime) user.createtime = CommonUtil.toDateString(user.createtime);
            if (user.lastlogintime) user.lastlogintime = CommonUtil.toDateString(user.lastlogintime);
            req.session.user = user;
            res.redirect('/cms/index');
            return;
        }
        res.render('cms/login', { status: 3, msg: '帐号不存在!', username: req.body.username });
    }, util.format(" where username='%s'", req.body.username));
});


// 用户中心
router.get('/user/center', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }
    res.render('cms/user/center', { user: user, website: website });
});
// 修改用户信息
router.post('/user/center', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }
    var entity = new User();
    entity.username = req.body.username;
    entity.displayname = req.body.displayname;
    entity.createtime = req.body.createtime;
    entity.lastlogintime = req.body.lastlogintime;
    entity.status = req.body.status && req.body.status == 'on' ? true : false;
    entity.id = user.id;
    entity.avatar = user.avatar;

    var sqlClient = new SqlClient();
    sqlClient.update(entity, function (result) {
        if (result != null && result > 0) {
            if (entity.createtime) entity.createtime = CommonUtil.toDateString(entity.createtime);
            if (entity.lastlogintime) entity.lastlogintime = CommonUtil.toDateString(entity.lastlogintime);
            req.session.user = entity;
            res.render('cms/user/center', { status: 1, msg: '修改成功!', user: entity, website: website });
            return;
        }
        res.render('cms/user/center', { status: 2, msg: '修改失败!', user: entity, website: website });
    });

});

// 设置密码
router.get('/user/forget', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }
    res.render('cms/user/forget', { user: user, website: website });
});

// 修改密码
router.post('/user/forget', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    var errmessage = ""
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }
    var entity = new User();
    entity.username = req.body.username;
    entity.password = req.body.password;
    entity.repassword = req.body.repassword;
    entity.displayname = req.body.displayname;
    entity.createtime = req.body.createtime;
    entity.lastlogintime = req.body.lastlogintime;
    entity.status = req.body.status && req.body.status == 'on' ? true : false;
    entity.id = user.id;
    entity.avatar = user.avatar;
    if(entity.password !== entity.repassword){
        res.redirect('/cms/user/forget');
        return;
    } else{
        var sqlClient = new SqlClient();
        sqlClient.update(entity, function (result) {
            if (result != null && result > 0) {
              
                if (entity.createtime) entity.createtime = CommonUtil.toDateString(entity.createtime);
                if (entity.lastlogintime) entity.lastlogintime = CommonUtil.toDateString(entity.lastlogintime);
                req.session.user = entity;
                res.render('cms/user/forget', { status: 1, msg: '修改成功!', user: entity, website: website });
                return;
            }
            res.render('cms/user/forget', { status: 2, msg: '修改失败!', user: entity, website: website });
        });
    }
  

});

// 企业优势
router.get('/e_advantage', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    sqlClient.query(website, function (result) {
        if (result != null && result.length > 0) {
            website = result[0];
            res.render('cms/e_advantage', { status: 1, msg: '已获取企业优势信息!', user: user,website:website});
            return;
        }
        res.render('cms/e_advantage', { status: 3, msg: '企业优势信息不存在!', user: user,website:website});
    });
});
// 更新企业优势
router.post('/e_advantage/update', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    website.id = req.body.id ? req.body.id : null;
    website.title  = req.body.title;
    website.advantage_name1 = req.body.advantage_name1;
    website.advantage_content1 = req.body.advantage_content1;
    website.advantage_name2 = req.body.advantage_name2;
    website.advantage_content2 = req.body.advantage_content2;
    website.advantage_name3 = req.body.advantage_name3;
    website.advantage_content3 = req.body.advantage_content3;
    website.advantage_name4 = req.body.advantage_name4;
    website.advantage_content4 = req.body.advantage_content4;
    website.advantage_content4 = req.body.advantage_content4;
    website.views = req.body.views ?  req.body.views : 0;
    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) website.id = result;
            res.render('cms/e_advantage', { status: 1, msg: '更新成功!', user: user,website:website});
            return;
        }
        res.render('cms/e_advantage', { status: 2, msg: '更新失败!', user: user,website:website});
    };

    if (website.id == null || website.id == "null") {
        isInsert = true;
        sqlClient.create(website, callback);
    } else {
        isInsert = false;
        sqlClient.update(website, callback);
    }
});








// 企业优势图片
// router.get('/e_advantage_photo', function (req, res, next) {
//     var user = req.session.user;
//     // var website = req.session.website;
//     if (!user) {
//         res.redirect('/cms/login');
//         return;
//     }

//     var sqlClient = new SqlClient();
//     var e_advantage_photo = new E_advantage_photo();
//     sqlClient.query(e_advantage_photo, function (result) {
//         if (result != null && result.length > 0) {
//             e_advantage_photo = result[0];
//             res.render('cms/e_advantage_photo', { status: 1, msg: '已获取企业优势图片信息!', user: user,e_advantage_photo:e_advantage_photo});
//             return;
//         }
//         res.render('cms/e_advantage_photo', { status: 3, msg: '企业优势图片信息不存在!', user: user,e_advantage_photo:e_advantage_photo});
//     });
// });
// 更新企业优势图片
// router.post('/e_advantage_photo/update', function (req, res, next) {
//     var user = req.session.user;
//     // var website = req.session.website;
//     if (!user) {
//         res.redirect('/cms/login');
//         return;
//     }

//     var sqlClient = new SqlClient();
//     var e_advantage_photo = new E_advantage_photo();
//     e_advantage_photo.id = req.body.id ? req.body.id : null;
//     e_advantage_photo.pic_url_loc  = req.body.pic_url_loc;
//     e_advantage_photo.pic_type  = req.body.pic_type;
//     e_advantage_photo.key_id  = req.body.key_id;
//     e_advantage_photo.pic_name  = req.body.pic_name;
//     e_advantage_photo.pic_url_cdn  = req.body.pic_url_cdn;
//     // var isInsert = false;
//     var callback = function (result) {
//         if (result != null && result > 0) {
//             // if (isInsert) website.id = result;
//             res.render('cms/e_advantage_photo', { status: 1, msg: '更新成功!',user:user,e_advantage_photo:e_advantage_photo});
//             return;
//         }
//         res.render('cms/e_advantage_photo', { status: 2, msg: '更新失败!',user:user,e_advantage_photo:e_advantage_photo});
//     };

//     if (e_advantage_photo.id == null || e_advantage_photo.id == "null") {
//         // isInsert = true;
//         sqlClient.update(e_advantage_photo, callback);
//     } 
//     else {
//         sqlClient.create(e_advantage_photo, callback);
//     }
// });
// 服务优势
router.get('/s_advantage', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    sqlClient.query(website, function (result) {
        if (result != null && result.length > 0) {
            website = result[0];
            res.render('cms/s_advantage', { status: 1, msg: '已获取服务优势信息!', user: user,website:website});
            return;
        }
        res.render('cms/s_advantage', { status: 3, msg: '服务优势信息不存在!', user: user,website:website});
    });
});
// 更新服务优势
router.post('/s_advantage/update', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    website.id = req.body.id ? req.body.id : null;
    website.title  = req.body.title;
    // website.pic_type = req.body.pic_type;
    // website.key_id = req.body.key_id ? req.body.key_id : null;
    // website.pic_name = req.body.pic_name;
    // website.pic_url_loc = req.body.pic_url_loc;
    // website.pic_url_cdn = null;

    // website.photo_main_id = req.body.photo_main_id;
    website.s_advantage_1 = req.body.s_advantage_1;
    website.s_advantage_2 = req.body.s_advantage_2;
    website.s_advantage_3 = req.body.s_advantage_3;
    website.s_advantage_4 = req.body.s_advantage_4;
    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) website.id = result;
            res.render('cms/s_advantage', { status: 1, msg: '更新成功!', user: user,website:website});
            return;
        }
        res.render('cms/s_advantage', { status: 2, msg: '更新失败!', user: user,website:website});
    };

    if (website.id == null || website.id == "null") {
        isInsert = true;
        sqlClient.create(website, callback);
    } else {
        isInsert = false;
        sqlClient.update(website, callback);
    }
});
// 案例分享
router.get('/case_share', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }
    var sqlClient = new SqlClient();
    var website = new  Website();
    sqlClient.query(website, function (result) {
        if (result != null && result.length > 0) {
            website = result[0];
            res.render('cms/case_share', { status: 1, msg: '已获取案例分享信息!', user: user,website:website});
            return;
        }
        res.render('cms/case_share', { status: 3, msg: '案例分享信息不存在!', user: user,website:website});
    });
});
// 更新案例分享
router.post('/case_share/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    website.id = req.body.id ? req.body.id : null;
    website.title  = req.body.title;
    website.case_share_1 = req.body.case_share_1;
    website.case_share_1_content = req.body.case_share_1_content;
    website.case_share_2 = req.body.case_share_2;
    website.case_share_2_content = req.body.case_share_2_content;
    website.case_share_3 = req.body.case_share_3;
    website.case_share_3_content = req.body.case_share_3_content;
    website.case_share_4 = req.body.case_share_4;
    website.case_share_4_content = req.body.case_share_4_content;
    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) website.id = result;
            res.render('cms/case_share', { status: 1, msg: '更新成功!', user: user,website:website});
            return;
        }
        res.render('cms/case_share', { status: 2, msg: '更新失败!', user: user,website:website});
    };

    if (website.id == null || website.id == "null") {
        isInsert = true;
        sqlClient.create(website, callback);
    } else {
        isInsert = false;
        sqlClient.update(website, callback);
    }
});

// 服务流程
router.get('/s_process', function (req, res, next) {
    var user = req.session.user;
    // var website = req.session.website;
    if (!user) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new  Website();
    sqlClient.query(website, function (result) {
        if (result != null && result.length > 0) {
            website = result[0];
            res.render('cms/s_process', { status: 1, msg: '已获取案例分享信息!', user: user,website:website});
            return;
        }
        res.render('cms/s_process', { status: 3, msg: '案例分享信息不存在!', user: user,website:website});
    });
});
// 更新服务流程
router.post('/s_process/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var website = new Website();
    website.id = req.body.id ? req.body.id : null;
    website.title  = req.body.title;
    website.s_process_1 = req.body.s_process_1;
    website.s_process_1_content = req.body.s_process_1_content;
    website.s_process_2 = req.body.s_process_2;
    website.s_process_2_content = req.body.s_process_2_content;
    website.s_process_3 = req.body.s_process_3;
    website.s_process_3_content = req.body.s_process_3_content;
    website.s_process_4 = req.body.s_process_4;
    website.s_process_4_content = req.body.s_process_4_content;
    website.s_process_5 = req.body.s_process_5;
    website.s_process_5_content = req.body.s_process_5_content;
    website.s_process_6 = req.body.s_process_6;
    website.s_process_6_content = req.body.s_process_6_content;
    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) website.id = result;
            res.render('cms/s_process', { status: 1, msg: '更新成功!', user: user,website:website});
            return;
        }
        res.render('cms/s_process', { status: 2, msg: '更新失败!', user: user,website:website});
    };

    if (website.id == null || website.id == "null") {
        isInsert = true;
        sqlClient.create(website, callback);
    } else {
        isInsert = false;
        sqlClient.update(website, callback);
    }
});
// 案例分享-App
router.get('/case_app', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_app = new Case_app();
    sqlClient.query(case_app, function (result) {
        if (result != null && result.length > 0) {
            case_app = result[0];
            if (case_app.createtime) case_app.createtime = CommonUtil.toDateString(case_app.createtime);
            res.render('cms/case_app', { status: 1, msg: '已获取案例分享APP信息!', user: user, website: website, case_app: case_app });
            return;
        }
        res.render('cms/case_app', { status: 3, msg: '案例分享APP信息不存在!', user: user, website: website, case_app: case_app });
    });
});
// 更新案例分享-App
router.post('/case_app/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_app = new Case_app();
    case_app.id = req.body.id ? req.body.id : null;
    case_app.name_1  = req.body.name_1 ;
    case_app.comment_1 = req.body.comment_1;
    case_app.name_2 = req.body.name_2;
    case_app.comment_2 = req.body.comment_2;
    case_app.name_3 = req.body.name_3;
    case_app.comment_3 = req.body.comment_3;
    case_app.createtime = req.body.createtime;

    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) case_app.id = result;
            case_app.createtime = CommonUtil.toDateString(case_app.createtime);
            res.render('cms/case_app', { status: 1, msg: '更新成功!', user: user, website: website, case_app: case_app });
            return;
        }
        res.render('cms/case_app', { status: 2, msg: '更新失败!', user: user, website: website, case_app: case_app });
    };

    if (case_app.id == null || case_app.id == "null") {
        isInsert = true;
        sqlClient.create(case_app, callback);
    } else {
        isInsert = false;
        sqlClient.update(case_app, callback);
    }
});
// 案例分享-微信开发
router.get('/case_wechat', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_wechat = new Case_wechat();
    sqlClient.query(case_wechat, function (result) {
        if (result != null && result.length > 0) {
            case_wechat = result[0];
            if (case_wechat.createtime) case_wechat.createtime = CommonUtil.toDateString(case_wechat.createtime);
            res.render('cms/case_wechat', { status: 1, msg: '已获取案例分享微信开发信息!', user: user, website: website, case_wechat: case_wechat });
            return;
        }
        res.render('cms/case_wechat', { status: 3, msg: '案例分享微信开发信息不存在!', user: user, website: website, case_wechat: case_wechat });
    });
});
// 更新案例分享-微信开发
router.post('/case_wechat/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_wechat = new Case_wechat();
    case_wechat.id = req.body.id ? req.body.id : null;
    case_wechat.name_1  = req.body.name_1 ;
    case_wechat.comment_1 = req.body.comment_1;
    case_wechat.name_2 = req.body.name_2;
    case_wechat.comment_2 = req.body.comment_2;
    case_wechat.createtime = req.body.createtime;

    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) case_wechat.id = result;
            res.render('cms/case_wechat', { status: 1, msg: '更新成功!', user: user, website: website, case_wechat: case_wechat });
            return;
        }
        res.render('cms/case_wechat', { status: 2, msg: '更新失败!', user: user, website: website, case_wechat: case_wechat });
    };

    if (case_wechat.id == null || case_wechat.id == "null") {
        isInsert = true;
        sqlClient.create(case_wechat, callback);
    } else {
        isInsert = false;
        sqlClient.update(case_wechat, callback);
    }
});
// 案例分享-企业官网
router.get('/case_website', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_website = new Case_website();
    sqlClient.query(case_website, function (result) {
        if (result != null && result.length > 0) {
            case_website = result[0];
            if (case_website.createtime) case_website.createtime = CommonUtil.toDateString(case_website.createtime);
            res.render('cms/case_website', { status: 1, msg: '已获取案例分享企业官网信息!', user: user, website: website, case_website: case_website });
            return;
        }
        res.render('cms/case_website', { status: 3, msg: '案例分享企业官网信息不存在!', user: user, website: website, case_website: case_website });
    });
});
// 更新案例分享-企业官网
router.post('/case_website/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_website = new Case_website();
    case_website.id = req.body.id ? req.body.id : null;
    case_website.name_1  = req.body.name_1 ;
    case_website.comment_1 = req.body.comment_1;
    case_website.name_2 = req.body.name_2;
    case_website.comment_2 = req.body.comment_2;
    case_website.createtime = req.body.createtime;

    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) case_website.id = result;
            res.render('cms/case_website', { status: 1, msg: '更新成功!', user: user, website: website, case_website: case_website });
            return;
        }
        res.render('cms/case_website', { status: 2, msg: '更新失败!', user: user, website: website, case_website: case_website });
    };

    if (case_website.id == null || case_website.id == "null") {
        isInsert = true;
        sqlClient.create(case_website, callback);
    } else {
        isInsert = false;
        sqlClient.update(case_website, callback);
    }
});
// 案例分享-管理系统
router.get('/case_system', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_system = new Case_system();
    sqlClient.query(case_system, function (result) {
        if (result != null && result.length > 0) {
            case_system = result[0];
            if (case_system.createtime) case_system.createtime = CommonUtil.toDateString(case_system.createtime);
            res.render('cms/case_system', { status: 1, msg: '已获取案例分享管理系统信息!', user: user, website: website, case_system: case_system });
            return;
        }
        res.render('cms/case_system', { status: 3, msg: '案例分享管理系统信息不存在!', user: user, website: website, case_system: case_system });
    });
});
// 更新案例分享-管理系统
router.post('/case_system/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var case_system = new Case_system();
    case_system.id = req.body.id ? req.body.id : null;
    case_system.name_1  = req.body.name_1 ;
    case_system.comment_1 = req.body.comment_1;
    case_system.name_2 = req.body.name_2;
    case_system.comment_2 = req.body.comment_2;
    case_system.createtime = req.body.createtime;

    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) case_system.id = result;
            res.render('cms/case_system', { status: 1, msg: '更新成功!', user: user, website: website, case_system: case_system });
            return;
        }
        res.render('cms/case_system', { status: 2, msg: '更新失败!', user: user, website: website, case_system: case_system });
    };

    if (case_system.id == null || case_system.id == "null") {
        isInsert = true;
        sqlClient.create(case_system, callback);
    } else {
        isInsert = false;
        sqlClient.update(case_system, callback);
    }
});
// 关于我们
router.get('/about_us', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var about_us = new About_us();
    sqlClient.query(about_us, function (result) {
        if (result != null && result.length > 0) {
            about_us = result[0];
            if (about_us.createtime) about_us.createtime = CommonUtil.toDateString(about_us.createtime);
            res.render('cms/about_us', { status: 1, msg: '已获取案例分享管理系统信息!', user: user, website: website, about_us: about_us });
            return;
        }
        res.render('cms/about_us', { status: 3, msg: '案例分享管理系统信息不存在!', user: user, website: website, about_us: about_us });
    });
});
// 更新关于我们
router.post('/about_us/update', function (req, res, next) {
    var user = req.session.user;
    var website = req.session.website;
    if (!user || !website) {
        res.redirect('/cms/login');
        return;
    }

    var sqlClient = new SqlClient();
    var about_us = new About_us();
    about_us.id = req.body.id ? req.body.id : null;
    about_us.c_introduce = req.body.c_introduce;
    about_us.p_cycle_1 = req.body.p_cycle_1;
    about_us.p_cycle_2 = req.body.p_cycle_2;
    about_us.p_cycle_3 = req.body.p_cycle_3;
    about_us.p_cycle_4 = req.body.p_cycle_4;
    about_us.p_cycle_5 = req.body.p_cycle_5;
    about_us.p_cycle_6 = req.body.p_cycle_6;
    about_us.p_cycle_7 = req.body.p_cycle_7;
    about_us.createtime = req.body.createtime;

    var isInsert = false;
    var callback = function (result) {
        if (result != null && result > 0) {
            if (isInsert) about_us.id = result;
            res.render('cms/about_us', { status: 1, msg: '更新成功!', user: user, website: website, about_us: about_us });
            return;
        }
        res.render('cms/about_us', { status: 2, msg: '更新失败!', user: user, website: website, about_us: about_us });
    };

    if (about_us.id == null || about_us.id == "null") {
        isInsert = true;
        sqlClient.create(about_us, callback);
    } else {
        isInsert = false;
        sqlClient.update(about_us, callback);
    }
});


// 获取图片信息
router.post('/picture/list', function (req, res, next) {
    var sqlClient = new SqlClient();
    if (req.body.key_id == 0) {
        if (req.body.pic_type == 1) {
            sqlClient.queryBySql(' select max(id) as id from product ', null, function (result) {
                if (result != null && result.length > 0) {
                    var id = result[0]["id"] + 1;
                    search_picture(id);
                }
            });
        } else if (req.body.pic_type == 3) {
            sqlClient.queryBySql(' select max(id) as id from photo ', null, function (result) {
                if (result != null && result.length > 0) {
                    var id = result[0]["id"] + 1;
                    search_picture(id);
                }
            });
        }
    } else {
        search_picture(req.body.key_id);
    }
    function search_picture(key_id) {
        var whereSql = util.format(" where pic_type=%s and key_id=%s  ", req.body.pic_type, key_id);
        var e_advantage_photo = new E_advantage_photo();
        sqlClient.query(e_advantage_photo, function (result) {
            if (result != null && result.length > 0) {
                res.json({ status: 1, msg: '查询成功!', data: result });
                return;
            }
            res.json({ status: 2, msg: '暂无记录!', data: result });
        }, whereSql);
    }
});
// 删除图片
router.post('/picture/delete/:id', function (req, res, next) {
    var sqlClient = new SqlClient();
    var e_advantage_photo = new E_advantage_photo();
    e_advantage_photo.id = req.params.id;
    sqlClient.deleteById(e_advantage_photo, function (result) {
        if (result != null && result > 0) {
            res.json({ status: 1, msg: '删除成功!' });
            return;
        }
        res.json({ status: 2, msg: '删除失败!' });
    });
});

// 上传图片
router.post('/picture/fileupload', function (req, res, next) {
    var cacheFolder = '/img/uploads/';
    var userDirPath = 'public' + cacheFolder;
    if (!fs.existsSync(userDirPath)) fs.mkdirSync(userDirPath);
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = userDirPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    var displayUrl;
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
        var extName = extractExtName(files.filesdata);
        if (extName.length === 0) {
            res.send({ status: 2, msg: "不支持此文件类型" });
            return;
        }
        var avatarName = Date.now() + '.' + extName;
        var newPath = form.uploadDir + avatarName;
        displayUrl = cacheFolder + avatarName;
        fs.renameSync(files.filesdata.path, newPath); //重命名

        if (!(fields.pic_type)) {
            res.send({ status: 1, msg: "上传成功", data: displayUrl, picid: 0 });
            return;
        }
        var sqlClient = new SqlClient();

        if (fields.key_id == 0) {
            sqlClient.queryBySql(' select max(id) as id from product ', null, function (result) {
                if (result != null && result.length > 0) {
                    var id = result[0]["id"] + 1;
                    create_picture(id);
                }
            });
        } else {
            create_picture(fields.key_id);
        }

        function create_picture(key_id) {
            var e_advantage_photo = new E_advantage_photo();
            e_advantage_photo.pic_type = fields.pic_type;
            e_advantage_photo.key_id = key_id ? key_id : null;
            e_advantage_photo.pic_name = avatarName;
            e_advantage_photo.pic_url_loc = displayUrl;
            e_advantage_photo.pic_url_cdn = null;
            var callback = function (result) {
                if (result != null && result > 0) {
                    res.send({ status: 1, msg: "上传成功", data: displayUrl, picid: result });
                    return;
                }
                res.send({ status: 2, msg: '上传失败!', data: displayUrl });
            };
            sqlClient.create(e_advantage_photo, callback);
        }
    });
});

// kindeditor上传图片
router.post('/kindeditor/fileupload', function (req, res, next) {
    var cacheFolder = '/img/uploads/';
    var userDirPath = 'public' + cacheFolder;
    if (!fs.existsSync(userDirPath)) fs.mkdirSync(userDirPath);
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = userDirPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    var displayUrl;
    form.parse(req, function (err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
        var extName = extractExtName(files.imgFile);
        if (extName.length === 0) {
            res.send({ status: 2, msg: "不支持此文件类型" });
            return;
        }
        var avatarName = Date.now() + '.' + extName;
        var newPath = form.uploadDir + avatarName;
        displayUrl = cacheFolder + avatarName;
        fs.renameSync(files.imgFile.path, newPath); //重命名

        var sqlClient = new SqlClient();
        var e_advantage_photo = new E_advantage_photo();
        e_advantage_photo.pic_type = 0;
        e_advantage_photo.key_id = null;
        e_advantage_photo.pic_name = avatarName;
        e_advantage_photo.pic_url_loc = displayUrl;
        e_advantage_photo.pic_url_cdn = null;
        var callback = function (result) {
            if (result != null && result > 0) {
                res.send({ error: 0, url: displayUrl });
                return;
            }
            res.send({ error: 2, url: displayUrl });
        };
        sqlClient.create(e_advantage_photo, callback);
    });
});
// 提取扩展名
function extractExtName(files) {
    var extName = ''; //后缀名
    switch (files.type) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;
        case 'image/jpg':
            extName = 'jpg';
            break;
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;
        case 'image/gif':
            extName = 'gif';
            break;
        case 'image/svg':
            extName = 'svg';
            break;
        case 'application/octet-stream':
            extName = 'jpg';
            break;
    }
    return extName;
}

module.exports = router;