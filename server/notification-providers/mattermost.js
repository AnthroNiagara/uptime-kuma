const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { DOWN, UP } = require("../../src/util");

class Mattermost extends NotificationProvider {
    name = "mattermost";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            const mattermostUserName = notification.mattermostusername || "Uptime Kuma";
            // If heartbeatJSON is null, assume non monitoring notification (Certificate warning) or testing.
            if (heartbeatJSON == null) {
                let mattermostTestData = {
                    username: mattermostUserName,
                    text: msg,
                };
                await axios.post(notification.mattermostWebhookUrl, mattermostTestData);
                return okMsg;
            }

            let mattermostChannel;
            if (typeof notification.mattermostchannel === "string") {
                mattermostChannel = notification.mattermostchannel.toLowerCase();
            }

            const mattermostIconEmoji = notification.mattermosticonemo;
            let mattermostIconEmojiOnline = "";
            let mattermostIconEmojiOffline = "";
            if (mattermostIconEmoji && typeof mattermostIconEmoji === "string") {
                const emojiArray = mattermostIconEmoji.split(" ");
                if (emojiArray.length >= 2) {
                    mattermostIconEmojiOnline = emojiArray[0];
                    mattermostIconEmojiOffline = emojiArray[1];
                }
            }

            const mattermostIconUrl = notification.mattermosticonurl;
            let iconEmoji = mattermostIconEmoji;

            if (heartbeatJSON.status === DOWN) {
                let mattermostdowndata = {
                    username: mattermostUserName,
                    channel: mattermostChannel,
                    icon_emoji: iconEmoji,
                    icon_url: mattermostIconUrl,
                    attachments: [
                        {
                            fallback: mattermostIconEmojiOffline + " Your service " + monitorJSON.name + " went down.",
                            color: "#FF0000",
                            title: "❌ Your service " + monitorJSON.name + " went down. ❌",
                            title_link: monitorJSON.url,
                            fields: [
                                {
                                    short: true,
                                    title: "Service Name",
                                    value: monitorJSON.name,
                                },
                                {
                                    short: true,
                                    title: monitorJSON.type === "push" ? "Service Type" : "Service URL",
                                    value: this.extractAddress(monitorJSON),
                                },
                                {
                                    short: false,
                                    title: `Time (${heartbeatJSON.timezone})`,
                                    value: heartbeatJSON.localDateTime,
                                },
                                {
                                    short: false,
                                    title: "Error",
                                    value: heartbeatJSON.msg == null ? "N/A" : heartbeatJSON.msg,
                                },
                            ],
                        }
                    ]
                };
                await axios.post(notification.mattermostWebhookUrl, mattermostdowndata);
                return okMsg;
            } else if (heartbeatJSON.status === UP) {
                let mattermostupdata = {
                    username: mattermostUserName,
                    channel: mattermostChannel,
                    icon_emoji: iconEmoji,
                    icon_url: mattermostIconUrl,
                    attachments: [
                        {
                            fallback: mattermostIconEmojiOnline + " Your service " + monitorJSON.name + " is up!",
                            color: "#32CD32",
                            title: "✅ Your service " + monitorJSON.name + " is up! ✅",
                            title_link: monitorJSON.url,
                            fields: [
                                {
                                    short: true,
                                    title: "Service Name",
                                    value: monitorJSON.name,
                                },
                                {
                                    short: true,
                                    title: monitorJSON.type === "push" ? "Service Type" : "Service URL",
                                    value: this.extractAddress(monitorJSON),
                                },
                                {
                                    short: false,
                                    title: `Time (${heartbeatJSON.timezone})`,
                                    value: heartbeatJSON.localDateTime,
                                },
                                {
                                    short: false,
                                    title: "Ping",
                                    value: heartbeatJSON.ping == null ? "N/A" : heartbeatJSON.ping + " ms",
                                },
                            ],
                        }
                    ]
                };
                await axios.post(notification.mattermostWebhookUrl, mattermostupdata);
                return okMsg;
            }
            // If we reach here, it means the status is unknown.

            let mattermostUnknownData = {
                username: mattermostUserName,
                channel: mattermostChannel,
                icon_emoji: iconEmoji,
                icon_url: mattermostIconUrl,
                attachments: [
                    {
                        fallback: mattermostIconEmoji + " Your service " + monitorJSON.name + " status is unknown.",
                        color: "#000000",
                        title: "Your service " + monitorJSON.name + " status is unknown.",
                        title_link: monitorJSON.url,
                        fields: [
                            {
                                short: true,
                                title: "Service Name",
                                value: monitorJSON.name,
                            },
                            {
                                short: true,
                                title: "Service Type",
                                value: monitorJSON.type === "push" ? "Service Type" : "Service URL",
                            },
                            {
                                short: false,
                                title: `Time (${heartbeatJSON.timezone})`,
                                value: heartbeatJSON.localDateTime,
                            },
                            {
                                short: false,
                                title: "Error",
                                value: heartbeatJSON.msg == null ? "N/A" : heartbeatJSON.msg,
                            },
                        ],
                    }
                ]
            };
            await axios.post(notification.mattermostWebhookUrl, mattermostUnknownData);
            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }
}

module.exports = Mattermost;
