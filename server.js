const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/vk-video', async (req, res) => {
    try {
        const rssUrl = 'https://vk.com/video-224692109?section=all&act=rss';
        const response = await fetch(rssUrl);
        const text = await response.text();

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(text);

        const items = result.rss.channel[0].item;
        if(!items || items.length === 0){
            return res.json({ error: 'Видео не найдено' });
        }

        let liveVideo = items.find(item => item.title[0].toLowerCase().includes('прямой эфир'));
        let video = liveVideo || items[0];

        const link = video.link[0];
        const match = link.match(/video(-?\d+)_(\d+)/);

        if(match){
            res.json({ owner_id: match[1], video_id: match[2] });
        } else {
            res.json({ error: 'Видео не найдено' });
        }

    } catch(err) {
        console.error(err);
        res.json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
