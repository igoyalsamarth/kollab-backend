export async function scrollToTheEnd(page:any) {

    let previousHeight;
    let loadingIndicatorExists = true;

    while (loadingIndicatorExists) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);

        // Check if the loading indicator exists
        try {
            await page.waitForSelector('div[data-visualcompletion="loading-state"]', { hidden: true, timeout: 2000 }); // 5 seconds
            loadingIndicatorExists = false
        } catch (error) {
            console.log('Loading indicator did not disappear');
            loadingIndicatorExists = true;
        }

        await new Promise(r => setTimeout(r, 2000)); // Adjust this timeout as needed    
    }

}