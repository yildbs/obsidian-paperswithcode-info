import { requestUrl, stringifyYaml, Notice } from "obsidian";

let cleanText = function(text : string|null){
    if (text == null){
        return null;
    }

    return text
    .replace(/\(.*\)/gi, "")
    .replace(/\[.*\]/gi, "")
    .replace(":", "\uFF1A")
    .replace("?", "\uFF1F")
    .trim();
}

const getPaperInfo = async (url : string) => {
    try {
		const response = await requestUrl({
			url: url  
		});

		const parser = new DOMParser();
		const html = parser.parseFromString(response.text, "text/html");

		new Notice("start!!!! ");

		let title =
            html!
            .querySelector("body > div.container.content.content-buffer > main > div.paper-title > div > div > h1")!
            .textContent;
        if (title != null){
            title = cleanText(title);
        }

        let authorsElement = 
            html
            .querySelectorAll("body > div.container.content.content-buffer > main > div.paper-title > div > div > div > p > span");
        const lenAuthors = authorsElement.length;
        let datePublished = null;
        let authors = []
        if (lenAuthors > 0){
            datePublished = cleanText(authorsElement[0].textContent);
            for(let index=1;index<lenAuthors;index++){
                let author = cleanText(authorsElement[index].textContent);
                if(author != null && author.length >= 3){
                    author = author.replace(" ", "");
                    authors.push(author);
                }
            }
        }

        let tasksElement = 
            html
            .querySelectorAll("#tasks > div > div.paper-tasks > div > div > a");
        const lenTasks = tasksElement.length;
        let tasks = []
        for(let index=0;index<lenTasks;index++){
            tasks.push(cleanText(tasksElement[index].textContent)?.replace(" ", ""))
        }

        let githubsElement = 
            html
            .querySelectorAll("#implementations-short-list > div");
        const lenGithubs = githubsElement.length;
        let gibhubs = []
        for(let index=0;index<lenGithubs;index++){
            let urlElement = githubsElement[index].querySelector("div.col-sm-7 > div > a");
            if(urlElement != null){
                gibhubs.push(urlElement.getAttribute("href"))
            }
        }

        let tagsFrontmatter = ''
        for (let index=0;index<tasks.length;index++){
            tagsFrontmatter += `  - ${tasks[index]}\n`
        }
        for (let index=0;index<authors.length;index++){
            tagsFrontmatter += `  - ${authors[index]}\n`
        }
        let tasksFrontmatter = ''
        for (let index=0;index<tasks.length;index++){
            tasksFrontmatter += `  - ${tasks[index]}\n`
        }
        let authorsFrontmatter = ''
        for (let index=0;index<authors.length;index++){
            authorsFrontmatter += `  - ${authors[index]}\n`
        }
        
		const result = 
`---
title : ${title}
tag: 
  - paperswithcode
${tagsFrontmatter}
tasks: 
${tasksFrontmatter}
authors: 
${authorsFrontmatter}
publish_date: ${datePublished}
start_study_date: ${moment(new Date()).format().split("T")[0]}
finish_study_date: ${moment(new Date()).format().split("T")[0]}
---

# ${title}
`;
		return [title, result];
	} catch (err) {
		console.log(err);
        return [null, "Error occured : " + err];
	}
};

export { getPaperInfo };
