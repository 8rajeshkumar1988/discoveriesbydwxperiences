function smoothScrolling() {
    const lenis = new Lenis();

    lenis.on('scroll', ScrollTrigger.update);


    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

}

gsap.registerPlugin(ScrollTrigger);


let scrollTimeout;

const showScrollItem = () => {
    scrollTimeout = setTimeout(() => {
        if (window.innerWidth > 700) {
            $('.scrolll').css({ display: 'flex' });
        } else {
            $('.swipe').css({ display: 'flex' });
        }
    }, 1500);
};


const makeFooterVisible = () => {
    console.log('makeFooterVisible');
    // $('#home').hide()
    $('#home').removeClass('home')
    $('#home').css({
        filter: 'blur(0px) brightness(1)'
    })
    $('#personality').css({ position: 'relative' });
    $('.insider').hide()
    $('.begin').hide()
    $('footer').css({ display: 'flex' });
    const scrollValue = $('#home').height();
    $('html, body').animate({ scrollTop: scrollValue }, 0);
    $('body').css({ overflow: 'unset' });
    smoothScrolling()
}

const startAnim = (next, type) => {
    $('body').css({
        overflow: 'hidden',
    });

    $('.insider').css({
        display: 'flex'
    });
    gsap.set(".insider", {
        x: 0,
        z: 0
    });
    $('#welcome').hide()
    // Animate transform properties correctly    
    if (next == 'six') {
        gsap.to("#personality", {
            duration: 1.1,
            scale: 1,
            y: '0vh',
            ease: "power4.out",
            onComplete: function () {
                makeFooterVisible()
            },
            onStart: function () {
                if (type !== 'clickaction') {
                    $('.insider').hide()
                }
                $('.begin').hide()
            }
        });

    } else {
        gsap.to(`.insider.${next}`, {
            duration: 1,
            scale: 1,
            y: '0vh',
            ease: "power4.out",
            overwrite: true,
        });
    }
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
function evaluateAnswers(actionn) {
    const name = getCookie("username");
    const answerData = getCookie("answer");

    if (!answerData) {
        console.log("No answers found.");
        $('body').css({ opacity: '1' });

        if (name) {
            gsap.to("#welcome", {
                transform: 'translateY(-100%)',
                duration: 0,
                ease: "power1.out",
                ease: "power4.out",
                onComplete: function () {
                    // $('body').css({ overflow: 'unset' });
                }
            });
            gsap.from('#smile, #dewars,  #discoveries, #by, #xperience', {
                y: '100px',
                duration: 1,
                opacity: 0,
                ease: "power4.out",
                stagger: 0.2,
                delay: 0.4
            })
            gsap.to('.begin', {
                transform: 'rotateX(0deg) rotateY(0deg) scale(0.8) translateY(100vh)',
                duration: 0.4,
                delay: 2
            })
            showScrollItem()
        }
        return;
    }

    let answers;
    try {
        answers = JSON.parse(answerData);
    } catch (e) {
        console.log("Invalid answer format.");
        return;
    }

    const answeredSteps = new Set();
    const count = { A: 0, B: 0, C: 0 };
    const sequence = [];
    let lastStep = 0;

    answers.forEach(ans => {
        const step = parseInt(ans.step);
        const val = ans.value;

        if (step >= 1 && step <= 5) {
            answeredSteps.add(step);
            if (step > lastStep) lastStep = step;
        }

        if (["A", "B", "C"].includes(val)) {
            count[val]++;
            sequence.push(val);
        }
    });

    if (answeredSteps.size < 5) {
        console.log(`Incomplete: Last completed step is ${lastStep}`);
        $('body').css({ opacity: '1' });

        const stepMap = {
            1: 'second',
            2: 'third',
            3: 'four',
            4: 'five'
        };

        if (stepMap[lastStep]) {
            startAnim(stepMap[lastStep], '');
            console.log(stepMap[lastStep]);
        }

        return;
    }

    const max = Math.max(count.A, count.B, count.C);
    const tied = Object.entries(count).filter(([_, v]) => v === max).map(([k]) => k);

    let finalType = tied.length === 1 ? tied[0] : null;

    if (!finalType) {
        const temp = { A: 0, B: 0, C: 0 };
        for (let val of sequence) {
            temp[val]++;
            if (temp[val] === 2 && tied.includes(val)) {
                finalType = val;
                break;
            }
        }
    }

    const resultMap = {
        A: "The Main Character",
        B: "The Social Anchor",
        C: "The Ever Curious"
    };

    const resultText = resultMap[finalType] || "Unknown";
    if (finalType == 'A') {
        $('#resultimg1').attr('src', '../../static/front/assets/glasses.webp')
        // $('#resultimg2').attr('src', '../../static/front/assets/expo2.jpg')
        $('.title').text('The Main Character')
        $('.copy').text('The one everyone ends up watching, whether they mean to or not. Whatever they choose naturally becomes part of the moment.')
    } else if (finalType == 'B') {
        $('#resultimg1').attr('src', '../../static/front/assets/glass.webp')
        $('.title').text('The Social Anchor')
        $('.copy').text('The one people settle around when the room feels scattered.')
    } else if (finalType == 'C') {
        $('#resultimg1').attr('src', '../../static/front/assets/book.webp')
        // $('#resultimg2').attr('src', '../../static/front/assets/story2.jpg')
        $('.title').text('The Ever Curious')
        $('.copy').html('The one always asking, "What&apos;s new?" before anyone else does.')
    }
    const firstName = name.split(" ")[0];
    $('.usernameRe').text(firstName)
    if (name) {
        console.log(`${name}, your personality is: ${resultText}`);
    } else {
        console.log(`Your personality is: ${resultText}`);
    }
    startAnim('six', actionn);
    $('body').css({ opacity: '1' });
    //function saveResult(option, cardName, isDownloaded = false, isShared = false) {}
    saveResult(finalType, resultText, false, false);
}

evaluateAnswers('')

$(document).ready(function () {
    $('.downloadBtn').on('click', function () {
        const target = document.querySelector("#result");

        html2canvas(target, {
            useCORS: true,
            scale: 2 // Improve quality
        }).then(originalCanvas => {
            // Create a new canvas of 1080x1920
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = 1080;
            finalCanvas.height = 1920;
            const ctx = finalCanvas.getContext("2d");

            // Calculate scale ratio
            const scaleX = finalCanvas.width / originalCanvas.width;
            const scaleY = finalCanvas.height / originalCanvas.height;
            const scale = Math.min(scaleX, scaleY); // Preserve aspect ratio

            const scaledWidth = originalCanvas.width * scale;
            const scaledHeight = originalCanvas.height * scale;

            const offsetX = (finalCanvas.width - scaledWidth) / 2;
            const offsetY = (finalCanvas.height - scaledHeight) / 2;

            // Draw scaled content centered
            ctx.drawImage(originalCanvas, 0, 0, originalCanvas.width, originalCanvas.height,
                offsetX, offsetY, scaledWidth, scaledHeight);

            // Save the image
            const link = document.createElement('a');
            const names = $('.usernameRe').text();
            const resultText = $('.title').text();
            link.download = `${names} - ${resultText} (Dewar's).png`;
            link.href = finalCanvas.toDataURL("image/png");
            link.click();
        });

        updateResult('downloaded');
    });





    let typeSplit = new SplitType("[animate]", {
        types: "lines, words",
        tagName: "span",
    });

    gsap.to("[animate] .line", {
        y: "0%",
        opacity: 1,
        duration: 0.5,
        filter: "blur(0px)",
        ease: "power1.out",
        stagger: 0.2,
    });
    gsap.to("#welcome > .inputContainer input", {
        y: "0%",
        opacity: 1,
        duration: 0.5,
        filter: "blur(0px)",
        ease: "power1.out",
        delay: 0.3
    });

    setTimeout(() => {
        if (window.innerWidth > 820) {
            let typeSplitnew = new SplitType("[animatenew]", {
                types: "lines, words",
                tagName: "span",
            });
            gsap.to("[animatenew] .line", {
                y: "0%",
                opacity: 1,
                duration: 0.5,
                filter: "blur(0px)",
                ease: "power1.out",
                stagger: 0.2,
                delay: 0.5
            });
        } else {
            gsap.to("[animatenew]", {
                y: "0%",
                opacity: 1,
                duration: 0.5,
                filter: "blur(0px)",
                ease: "power1.out",
                stagger: 0.2,
                delay: 0.5
            });
        }
    }, 100)
    gsap.to("#checkbox", {
        y: "0%",
        opacity: 1,
        duration: 0.5,
        filter: "blur(0px)",
        ease: "power1.out",
        stagger: 0.2,
        delay: 0.5
    });
    gsap.to("#welcome button", {
        y: "0%",
        opacity: 1,
        duration: 0.5,
        filter: "blur(0px)",
        ease: "power1.out",
        stagger: 0.2,
        delay: 0.8
    });
});



// Text animation function
function animateSplitText() {
    const elements = $("[typeSplitNewNewNewNew]");
    // Split all elements at once
    new SplitType(elements, {
        types: "lines, words",
        tagName: "span"
    });

    // Animate all .line spans at once
    gsap.from(elements.find(".line"), {
        y: "200px",
        opacity: 0,
        duration: 0.5,
        filter: "blur(10px)",
        ease: "power1.out",
        stagger: 0.2,
        delay: 0.2
    });
    const elements1 = $("[typeSplitNewNewNew]");
    // Split all elements at once
    new SplitType(elements1, {
        types: "lines, words",
        tagName: "span"
    });

    // Animate all .line spans at once
    gsap.from(elements1.find(".word"), {
        y: "200px",
        opacity: 0,
        duration: 0.6,
        filter: "blur(10px)",
        ease: "power1.out",
        stagger: 0.1,
        delay: 0.5
    });

    gsap.from('.begin button', {
        y: "100%",
        opacity: 0,
        duration: 0.6,
        filter: "blur(10px)",
        ease: "power1.out",
        delay: 1.4
    });
}


let lastDelta = 0;
let scrolling = true;

$('#home').on('wheel', function (e) {
    e.preventDefault(); // optional: disable native scroll if needed
    const deltaY = e.originalEvent.deltaY;

    const transform = $('.begin').css('transform');
    let translateY = 0;

    if (transform !== 'none') {
        const values = transform.match(/matrix.*\((.+)\)/)[1].split(', ');
        translateY = parseFloat(values[5]); // 6th value is translateY
        console.log('translateY:', translateY);
    } else {
        console.log('No transform applied.');
    }

    $('#home').css({ 'pointer-events': 'none' });
    clearTimeout(scrollTimeout);
    $('.scrolll').css({ display: 'none' });

    if (deltaY > 0) {
        // Scroll Down
        if (scrolling) {
            scrolling = false;
            gsap.to(".begin", {
                transform: 'rotateX(0deg) rotateY(0deg) scale(1) translateY(0vh)',
                duration: 1.5,
                ease: "power4.out",
                onStart: function () {
                    if (translateY > 100) {
                        animateSplitText();
                    }
                },
                onComplete: function () {
                    scrolling = true;
                    $('#home').css({ 'pointer-events': 'auto' });
                }
            });
        }
    } else if (deltaY < 0) {
        // Scroll Up
        if (scrolling) {
            scrolling = false;
            gsap.to(".begin", {
                transform: 'rotateX(0deg) rotateY(0deg) scale(0.8) translateY(100vh)',
                duration: 1.5,
                ease: "power4.out",
                onComplete: function () {
                    scrolling = true;
                    $('#home').css({ 'pointer-events': 'auto' });
                }
            });
            showScrollItem();
        }
    }

    scrollTimeout = setTimeout(() => {
        $('#home').css({ 'pointer-events': 'auto' });
        scrolling = true;
    }, 2600); // prevent multiple animations
});


let swipe = true
let startY = 0;
$('#home').on('touchstart', function (e) {
    startY = e.originalEvent.touches[0].clientY;
});
$('#home').on('touchend', function (e) {
    $('.swipe').css({ display: 'none' });
    const transform = $('.begin').css('transform');
    let translateYNew = 0;
    if (transform !== 'none') {
        const values = transform.match(/matrix.*\((.+)\)/)[1].split(', ');
        translateYNew = parseFloat(values[5]); // 6th value is translateY
        console.log('translateY:', translateYNew);
    } else {
        console.log('No transform applied.');
    }

    const endY = e.originalEvent.changedTouches[0].clientY;
    const deltaY = startY - endY;
    if (deltaY > 50) {        
        if (swipe) {
            $('#home').css({ 'pointer-events': 'none' });
            gsap.to(".begin", {
                transform: 'rotateX(0deg) rotateY(0deg) scale(1) translateY(0vh)',
                duration: 1.5,
                ease: "power4.out",
                onStart: function () {
                    if (translateYNew > 100) {
                        animateSplitText()
                        $('#home').css({ 'pointer-events': 'auto' });
                    }
                },
                onComplete: function () {
                    setTimeout(() => {
                        swipe = true
                    },100)
                }
            });
        }
        swipe = false
    } else if (deltaY < -50) {
        if (swipe) {
            $('#home').css({ 'pointer-events': 'none' });
            gsap.to(".begin", {
                transform: 'rotateX(0deg) rotateY(0deg) scale(0.8) translateY(100vh)',
                duration: 1.5,
                ease: "power4.out",
                onComplete: function () {
                    setTimeout(() => {
                        swipe = true
                    },100)
                    $('#home').css({ 'pointer-events': 'auto' });
                }
            });
            showScrollItem();
        }
        swipe = false
    }
});


$('#submit').click(function () {
    if ($('#name').val() == '') {
        $('#name').css({
            borderColor: 'red'
        })
        setTimeout(() => {
            $('#name').css({
                borderColor: '#873825'
            })
        }, 200)
        return
    }
    if ($('#location').val() == '') {
        $('#location').css({
            borderColor: 'red'
        })
        setTimeout(() => {
            $('#location').css({
                borderColor: '#873825'
            })
        }, 200)
        return
    }
    if (!$("#checkbox").is(":checked")) {
        $('#checkbox').css({
            scale: '1.2',
        })
        setTimeout(() => {
            $('#checkbox').css({
                scale: '1',
            })
        }, 200)
        return
    };

    saveuser()
    const username = $('#name').val();
    document.cookie = `username=${username}; path=/; max-age=` + 60 * 60 * 24 * 365 * 100;

    gsap.to("#welcome", {
        transform: 'translateY(-100%)',
        top: '-50vh',
        duration: 3,
        ease: "power4.out",
        onComplete: function () {
            $('body').css({
                // overflow: 'unset',
            })
        }
    })
    gsap.from('#smile, #dewars,  #discoveries, #by, #xperience', {
        y: '100px',
        duration: 1,
        opacity: 0,
        ease: "power4.out",
        stagger: 0.2,
        delay: 0.4
    })
    gsap.to('.begin', {
        transform: 'rotateX(0deg) rotateY(0deg) scale(0.8) translateY(100vh)',
        duration: 0.4,
        delay: 2
    })
    showScrollItem()
})





$('#diveinto').click(function () {
    // Set required styles on body and insider container
    $('body').css({
        overflow: 'hidden',
    });

    gsap.to('.begin', {
        transform: 'rotateX(10deg) rotateY(10deg) scale(0.7)',
        duration: 1.1,
        filter: 'blur(5px) brightness(0.9)',
    })

    $('.insider').css({
        display: 'flex'
    });
    gsap.set(".insider.first", {
        x: 0,
        z: 0
    });
    // Animate transform properties correctly
    gsap.to(".insider.first", {
        duration: 1.1,
        y: '0vh',
        overwrite: true,
        onComplete: function () {
            $('.begin').css({
                opacity: '0'
            })
        }
    });
});

const secAnim = (prev, next) => {
    $('#home').css({
        filter: 'blur(2px) brightness(0.5)'
    })
    $('.begin').css({
        opacity: '0'
    })
    $('body').css({
        overflow: 'hidden',
    });

    $('.insider').css({
        display: 'flex'
    });
    const nameToIndex = {
        first: 1,
        second: 2,
        third: 3,
        four: 4,
        five: 5,
        six: 6
    };

    const index = nameToIndex[prev];
    const rotateY = index % 2 === 0 ? '10deg' : '-10deg';

    console.log(prev);

    gsap.to(`.insider.${prev}`, {
        duration: 1.1,
        rotateX: '10deg',
        rotateY: rotateY,
        scale: 0.7,
        y: '0vh',
        ease: "power4.out",
        filter: 'blur(5px) brightness(0.9)',
        overwrite: true,
    });

    if (next !== 'six') {
        gsap.to(`.insider.${next}`, {
            duration: 1.1,
            scale: 1,
            y: '0vh',
            overwrite: true,
            ease: "power4.out",
        });
    } else {
        gsap.to("#personality", {
            duration: 1.1,
            scale: 1,
            y: '0vh',
            ease: "power4.out",
            onComplete: function () {
                makeFooterVisible()
            }
        });
    }
}




function setAnswerStep(step, value) {
    let answerData = getCookie("answer");
    let answers = [];

    // If existing cookie, parse it
    if (answerData) {
        try {
            answers = JSON.parse(answerData);
        } catch (e) {
            console.error("Invalid cookie format");
        }
    }

    // Update or push the new step
    const existing = answers.findIndex(a => a.step === step);
    if (existing !== -1) {
        answers[existing].value = value;
    } else {
        answers.push({ step: step, value: value });
    }

    // Save updated cookie
    document.cookie = `answer=${JSON.stringify(answers)}; path=/; max-age=${60 * 60 * 24 * 365 * 100}`;
}



const flipAnim = (idd) => {
    gsap.to(`.insider.${idd}  .swiper-slide`, {
        y: '80vh',
        stagger: {
            each: 0.1,
            from: "end"  // animate from last to first
        },
        duration: 0.8,
        ease: "power4.out"
    })
}



$(document).on('click', '.insider.first .swiper-slide', function () {
    $(this).addClass('active')
    $(this).parent().css({ 'pointer-events': 'none' });
    $(this).parent().addClass('selected')
    const questionId = $(this).attr('questionId')
    const optionId = $(this).attr('optionId')
    submitQuizAttempt(questionId, optionId)
    const anss = $(this).find('.count').text()
    setAnswerStep(1, `${anss}`);
    setTimeout(() => {        
        flipAnim('first')
    },600)
    setTimeout(() => {
        secAnim('first', 'second');
    }, 1000)
});
$(document).on('click', '.insider.second .swiper-slide', function () {
    $(this).addClass('active')
    $(this).parent().css({ 'pointer-events': 'none' });
    $(this).parent().addClass('selected')
    const anss = $(this).find('.count').text()
    const questionId = $(this).attr('questionId')
    const optionId = $(this).attr('optionId')
    submitQuizAttempt(questionId, optionId)
    setAnswerStep(2, `${anss}`);
    setTimeout(() => {        
        flipAnim('second')
    },600)
    setTimeout(() => {
        secAnim('second', 'third');
    }, 1000)
});
$(document).on('click', '.insider.third .swiper-slide', function () {
    $(this).addClass('active')
    $(this).parent().css({ 'pointer-events': 'none' });
    $(this).parent().addClass('selected')
    const anss = $(this).find('.count').text()
    const questionId = $(this).attr('questionId')
    const optionId = $(this).attr('optionId')
    submitQuizAttempt(questionId, optionId)
    setAnswerStep(3, `${anss}`);
    setTimeout(() => {        
        flipAnim('third')
    },600)
    setTimeout(() => {
        secAnim('third', 'four');
    }, 1000)
});
$(document).on('click', '.insider.four .swiper-slide', function () {
    $(this).addClass('active')
    $(this).parent().css({ 'pointer-events': 'none' });
    $(this).parent().addClass('selected')
    const anss = $(this).find('.count').text()
    const questionId = $(this).attr('questionId')
    const optionId = $(this).attr('optionId')
    submitQuizAttempt(questionId, optionId)
    setAnswerStep(4, `${anss}`);
    setTimeout(() => {        
        flipAnim('four')
    },600)
    setTimeout(() => {
        secAnim('four', 'five');
    }, 1000)
});
$(document).on('click', '.insider.five .swiper-slide', function () {
    $(this).addClass('active')
    $(this).parent().css({ 'pointer-events': 'none' });
    $(this).parent().addClass('selected')
    const anss = $(this).find('.count').text()
    const questionId = $(this).attr('questionId')
    const optionId = $(this).attr('optionId')
    submitQuizAttempt(questionId, optionId)
    setAnswerStep(5, `${anss}`);
    setTimeout(() => {        
        flipAnim('five')
    },600)
    setTimeout(() => {
        secAnim('five', 'six');
        evaluateAnswers('clickaction')
    }, 1000)
});


// if (window.innerWidth <= 700) {
//     $('.swiper_first').each(function (index, element) {
//         new Swiper(element, {
//             // effect: "coverflow",
//             slidesPerView: "1.1",
//             centeredSlides: true,
//             spaceBetween: 30,
//             pagination: {
//                 el: $(element).find('.swiper-pagination')[0],
//             },
//             // coverflowEffect: {
//             //     rotate: 10,
//             //     stretch: 20,
//             //     depth: 100,
//             //     modifier: 1,
//             //     slideShadows: true,
//             // },
//         });
//     });
// }

document.querySelectorAll("#name").forEach((input) => {
    input.addEventListener("input", function () {
        const inputValue = this.value;
        const textValue = inputValue.replace(/\d/g, ""); // Remove numeric characters
        this.value = textValue;
    });
});

const container = document.getElementById('result');
$('.share').on('click', async function () {
    const container = document.querySelector("#result"); // Make sure this is defined

    try {
        const originalCanvas = await html2canvas(container, {
            useCORS: true,
            scale: 2
        });

        // Create a new 1080x1920 canvas
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = 1080;
        finalCanvas.height = 1920;
        const ctx = finalCanvas.getContext("2d");

        // Calculate scale and offset to center the image
        const scaleX = finalCanvas.width / originalCanvas.width;
        const scaleY = finalCanvas.height / originalCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        const scaledWidth = originalCanvas.width * scale;
        const scaledHeight = originalCanvas.height * scale;
        const offsetX = (finalCanvas.width - scaledWidth) / 2;
        const offsetY = (finalCanvas.height - scaledHeight) / 2;

        // Draw the scaled image
        ctx.drawImage(
            originalCanvas,
            0, 0, originalCanvas.width, originalCanvas.height,
            offsetX, offsetY, scaledWidth, scaledHeight
        );

        // Convert to Blob
        const blob = await new Promise(resolve =>
            finalCanvas.toBlob(resolve, 'image/png')
        );
        const file = new File([blob], 'personality_card.png', { type: 'image/png' });

        // Try Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'My Personality Card',
                text: 'Check out my personality result!'
            });
        } else {
            throw new Error("Sharing not supported");
        }
    } catch (err) {
        // Fallback: Download the image
        const downloadLink = document.createElement('a');
        downloadLink.download = 'personality_card.png';
        downloadLink.href = finalCanvas.toDataURL('image/png');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        alert('Sharing failed or not supported. Please open Instagram and share the downloaded image manually.');
    }

    updateResult('share');
});




const saveuser = () => {
    const name = $('#name').val();
    const location = $('#location').val();
    $.ajax({
        url: '/save-participant/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name: name,location:location,class_type:class_type }),
        success: function (response) {
            console.log('User saved successfully:', response);
            document.cookie = `userid=${response.participant_id}; path=/; max-age=` + 60 * 60 * 24 * 365 * 100;
        },
        error: function (xhr) {
            console.log("Error: " + xhr.responseJSON.error);
        }
    });
}



function submitQuizAttempt(quizId, optionId) {
    const participantId = getCookie("userid");
    console.log("Participant ID:", participantId);
    $.ajax({
        url: '/save-quiz-attempt/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            participant_id: participantId,
            quiz_id: quizId,
            option_id: optionId
        }),
        success: function (response) {
            console.log(response.message); 0
            console.log("Attempt ID:", response.attempt_id);
        },
        error: function (xhr) {
            response.log("Error: " + xhr.responseJSON?.error || "Something went wrong");
        }
    });
}


function saveResult(option, cardName, isDownloaded = false, isShared = false) {
    const participantId = getCookie("userid");

    if (!participantId) {
        console.log("Participant ID not found in cookies.");
        return;
    }

    $.ajax({
        url: '/save-participant-result/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            participant_id: participantId,
            option: option,
            card_name: cardName,
        }),
        success: function (response) {
            console.log(response.message);
            document.cookie = `resultid=${response.result_id}; path=/; max-age=` + 60 * 60 * 24 * 365 * 100;
        },
        error: function (xhr) {
            console.error("Error: " + (xhr.responseJSON?.error || "Something went wrong"));
        }
    });
}


function updateResult(type) {
    const participantId = getCookie("resultid");

    if (!participantId) {
        console.log("result Id not found in cookies.");
        return;
    }
    const payload = {
        result_id: participantId
    };

    if (type === "share") {
        payload.is_shared = true;
    } else if (type === "downloaded") {
        payload.is_downloaded = true;
    } else {
        console.warn("Invalid type provided:", type);
        return;
    }

    $.ajax({
        url: '/update-result-flags/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function (response) {
            console.log(response.message);
        },
        error: function (xhr) {
            console.error(xhr.responseJSON?.error || "Error occurred");
        }
    });
}




