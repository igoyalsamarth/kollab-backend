export async function scrollToTheEnd(page:any) {
    let previousHeight;
    let loadingIndicatorExists = true;

    while (loadingIndicatorExists) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000)); // Adjust this timeout as needed

        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) {
            loadingIndicatorExists = false;
            console.log('Reached the end of the page');
        } else {
            try {
                await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 });
            } catch (error) {
                loadingIndicatorExists = false;
                console.log('Scroll height did not increase within 5 seconds');
            }
        }
    }
}