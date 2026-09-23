const ios = require('../ios.js');
var assert = require('assert');

function request(appId) {
    return {
        "body": {
            "message": "Someone is at the front door",
            "title": "Doorbell",
            "registration_info": { "app_id": appId, "app_version": "1.0", "os_version": "18.0" },
            "data": {
                "url": "/lovelace/0",
                "entity_id": "camera.front_door",
                "attachment": { "url": "/media/local/doorbell.jpg", "content-type": "jpeg" },
                "push": { "interruption-level": "time-sensitive" }
            }
        }
    };
}

describe('ios.js', function () {
    ['io.robbie.HomeAssistant', 'io.robbie.HomeAssistant.dev', 'com.yildiz.MySmartHomes'].forEach(appId => {
        it(`passes attachments, url and interruption level for ${appId}`, function () {
            const apns = ios.createPayload(request(appId)).payload.apns.payload;
            assert.deepStrictEqual(apns.attachment, { "url": "/media/local/doorbell.jpg", "content-type": "jpeg" });
            assert.strictEqual(apns.url, "/lovelace/0");
            assert.strictEqual(apns.entity_id, "camera.front_door");
            assert.strictEqual(apns.aps["interruption-level"], "time-sensitive");
            assert.strictEqual(apns.aps.mutableContent, true);
        });
    });

    it('sends only title and body for other apps', function () {
        const apns = ios.createPayload(request('com.example.other')).payload.apns.payload;
        assert.strictEqual(apns.attachment, undefined);
        assert.strictEqual(apns.url, undefined);
        assert.strictEqual(apns.aps.mutableContent, undefined);
        assert.strictEqual(apns.aps.alert.body, "Someone is at the front door");
    });
});
