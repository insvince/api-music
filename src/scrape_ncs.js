const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://ncs.io/music-search?q=&genre=&mood=&version=regular&page=';
const TOTAL_PAGES = 20; // Số trang cần cào

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let allSongs = [];
    let songId = 1; // ID bắt đầu từ 1 và tăng dần

    for (let i = 1; i <= TOTAL_PAGES; i++) {
        console.log(`🔍 Đang cào dữ liệu từ trang ${i}...`);
        await page.goto(BASE_URL + i, { waitUntil: 'domcontentloaded' });

        let songs = await page.evaluate((songId) => {
            let results = [];
            let rows = document.querySelectorAll("tr[role='row']");

            rows.forEach((row) => {
                let playBtn = row.querySelector('.player-play');
                let name = row.querySelector('td:nth-child(4) p')?.textContent.trim();
                let author = row.querySelector('td:nth-child(4) span')?.textContent.trim();
                let url = playBtn?.getAttribute('data-url');
                let image = playBtn?.getAttribute('data-cover');
                let genre = row.querySelector('td:nth-child(5) a')?.textContent.trim();
                let releaseDate = row.querySelector('td:nth-child(6)')?.textContent.trim();
                let versions = row.querySelector('td:nth-child(7)')?.textContent.trim();

                if (name && url) {
                    results.push({
                        id: songId++,
                        name,
                        author,
                        url,
                        genre,
                        releaseDate,
                        versions,
                        links: {
                            images: [{ url: image }],
                        },
                    });
                }
            });

            return { results, newSongId: songId };
        }, songId);

        allSongs = allSongs.concat(songs.results);
        songId = songs.newSongId; // Cập nhật ID tiếp tục tăng
    }

    console.log('✅ Hoàn thành! Đang lưu vào file...');
    fs.writeFileSync('src/public/ncs_songs.json', JSON.stringify(allSongs, null, 2), 'utf-8');

    console.log('🎵 Dữ liệu đã được lưu vào `ncs_songs.json`.');
    await browser.close();
})();

// Lưu ý: Đảm bảo bạn đã cài đặt puppeteer và fs bằng npm
// bằng lệnh: npm install puppeteer fs
// Chạy script này bằng lệnh: node scrape_ncs.js
// Bạn có thể thay đổi TOTAL_PAGES để cào nhiều hoặc ít trang hơn
