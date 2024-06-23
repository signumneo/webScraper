(async function() {
    try {
        // Clear console to start fresh
        console.clear();

        // Log start of script execution
        console.log("Script started...");

        // Function to get all courses on the current page
        const getCoursesOnPage = () => {
            const courses = [];
            const courseElements = document.querySelectorAll('.enrolled-course-card--container--WJYo9 .course-card-title-module--title--W49Ap .course-card-title-module--course-title--wmFXN a');
            console.log(`Found ${courseElements.length} course elements on this page.`);
            courseElements.forEach(courseElement => {
                const courseTitle = courseElement.innerText;
                const courseUrl = courseElement.href;
                console.log(`Course Title: ${courseTitle}, Course URL: ${courseUrl}`);
                courses.push({ title: courseTitle, url: courseUrl });
            });
            return courses;
        };

        // Function to navigate to a specific page or the next page if a specific page is not found
        const goToPage = async (pageNumber) => {
            let pageLink = document.querySelector(`a[data-page="${pageNumber}"]`);
            if (!pageLink) {
                console.log(`Attempting to click next arrow...`);
                pageLink = document.querySelector('a[data-page="+1"]');
            }
            if (pageLink) {
                console.log(`Navigating to the next page...`);
                pageLink.click();
                await new Promise(resolve => setTimeout(resolve, 8000)); // Wait time to ensure page loads
                console.log(`Page ${pageNumber} or the next page loaded.`);
                return true;
            }
            console.error(`Page link for page ${pageNumber} or the next page not found.`);
            return false;
        };

        // Function to get the total number of pages
        const getTotalPages = () => {
            const paginationLinks = document.querySelectorAll('.pagination--pagination--8GSdS a[data-page]');
            let maxPage = 1;
            paginationLinks.forEach(link => {
                const pageNum = parseInt(link.getAttribute('data-page'), 10);
                if (!isNaN(pageNum) && pageNum > maxPage) {
                    maxPage = pageNum;
                }
            });
            console.log(`Total pages found: ${maxPage}`);
            return maxPage;
        };

        // Function to get course duration from course page opened in a new tab
        const getCourseDuration = async (courseUrl) => {
            console.log(`Opening course URL in new tab: ${courseUrl}`);
            const newTab = window.open(courseUrl, '_blank');

            return new Promise((resolve, reject) => {
                const checkDuration = async () => {
                    try {
                        if (!newTab || newTab.closed) {
                            reject(new Error('Tab was closed before fetching duration'));
                            return;
                        }

                        // Wait for the new tab to load completely
                        if (newTab.document.readyState === 'complete') {
                            const durationElement = newTab.document.querySelector('.course-stats--video-length--mzPnS .ud-heading-md');
                            if (durationElement) {
                                const duration = durationElement.innerText;
                                console.log(`Course duration found: ${duration}`);
                                newTab.close();
                                console.log(`Tab closed after processing course: ${courseUrl}`);
                                resolve(duration);
                            } else {
                                throw new Error('Duration element not found');
                            }
                        } else {
                            setTimeout(checkDuration, 4000); // Retry after 1 second if the document is not ready
                        }
                    } catch (error) {
                        console.error(`Error while checking for duration: ${error.message}`);
                        if (newTab.closed) {
                            reject(new Error('Tab was closed before fetching duration'));
                        } else {
                            setTimeout(checkDuration, 4000); // Retry after 1 second
                        }
                    }
                };

                setTimeout(checkDuration, 4000); // Initial delay before checking
            });
        };

        // Collect all courses from all pages
        const allCourses = [];
        const totalPages = getTotalPages();

        for (let page = 1; page <= totalPages; page++) {
            console.log(`Processing page ${page}...`);

            // Navigate to the current page if not on the first page
            if (page > 1) {
                const success = await goToPage(page);
                if (!success) {
                    console.error(`Failed to navigate to page ${page}.`);
                    break;
                }
            }

            // Get courses on the current page
            const coursesOnPage = getCoursesOnPage();
            allCourses.push(...coursesOnPage);

            // Log progress
            console.log(`Collected ${coursesOnPage.length} courses from page ${page}.`);
        }

        // Sequentially open each course URL to fetch the duration and append to the course data
        for (const course of allCourses) {
            try {
                console.log(`Fetching duration for course: ${course.title}`);
                const duration = await getCourseDuration(course.url);
                course.duration = duration;
                console.log(`Duration for ${course.title}: ${course.duration}`);

                // Add a delay before processing the next course to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 4000)); // Adjust delay time as needed (2 seconds in this example)
            } catch (error) {
                console.error(`Error fetching duration for course "${course.title}": ${error}`);
            }
        }

        // Display all collected courses in a tabular format
        console.table(allCourses);
        console.log(`Total number of courses collected: ${allCourses.length}`);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCourses));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "courses_with_duration.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();
