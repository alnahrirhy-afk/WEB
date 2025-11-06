// Rulers Section JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const rulersData = [
        {
            id: 1,
            name: "صلاح الدين الأيوبي",
            brief: "قائد عسكري وسياسي أسس الدولة الأيوبية، حرر القدس من الصليبيين عام 1187",
            image: "assets/images/hittin.png",
            bio: "صلاح الدين الأيوبي (532-589هـ/1137-1193م) هو مؤسس الدولة الأيوبية وأول ملوكها. اشتهر بتوحيد المسلمين تحت رايته وتحرير بيت المقدس من الصليبيين.",
            achievements: [
                {
                    title: "تحرير القدس",
                    date: "1187",
                    description: "نجح في تحرير القدس من الصليبيين بعد معركة حطين الشهيرة"
                },
                {
                    title: "توحيد الجبهة الإسلامية",
                    date: "1175",
                    description: "وحد مصر والشام تحت حكمه وأسس الدولة الأيوبية"
                },
                {
                    title: "إصلاحات داخلية",
                    date: "1176-1186",
                    description: "قام بإصلاحات إدارية وعسكرية شاملة وبنى المدارس والقلاع"
                }
            ],
            gallery: [
                {
                    image: "assets/images/hittin.png",
                    caption: "معركة حطين"
                },
                {
                    image: "images/rulers/saladin-jerusalem.jpg",
                    caption: "دخول القدس"
                }
            ]
        },
        {
            id: 2,
            name: "هارون الرشيد",
            brief: "خليفة عباسي عظيم، اشتهر عصره بالازدهار العلمي والثقافي",
            image: "images/rulers/harun-alrashid.jpg",
            bio: "هارون الرشيد (170-193هـ/786-809م) هو خامس الخلفاء العباسيين وأشهرهم. بلغت الدولة العباسية في عهده أوج قوتها وازدهارها.",
            achievements: [
                {
                    title: "تأسيس بيت الحكمة",
                    date: "786-809",
                    description: "أنشأ بيت الحكمة في بغداد كمركز للترجمة والعلوم"
                },
                {
                    title: "ازدهار الحضارة",
                    date: "786-809",
                    description: "شهد عصره نهضة علمية وثقافية كبيرة في مختلف المجالات"
                },
                {
                    title: "توسع الدولة",
                    date: "789-805",
                    description: "وصلت حدود الدولة إلى أقصى اتساع لها في عهده"
                }
            ],
            gallery: [
                {
                    image: "images/rulers/harun-court.jpg",
                    caption: "مجلس هارون الرشيد"
                },
                {
                    image: "images/rulers/baghdad-golden.jpg",
                    caption: "بغداد في العصر الذهبي"
                }
            ]
        },
        {
            id: 3,
            name: "عبد الرحمن الداخل",
            brief: "مؤسس الدولة الأموية في الأندلس ولُقب بصقر قريش",
            image: "images/rulers/abdulrahman.jpg",
            bio: "عبد الرحمن الداخل (113-172هـ/731-788م) هو مؤسس الدولة الأموية في الأندلس. نجا من مجزرة العباسيين للأمويين وأسس إمارة مستقلة في الأندلس.",
            achievements: [
                {
                    title: "تأسيس إمارة الأندلس",
                    date: "756",
                    description: "نجح في تأسيس إمارة أموية مستقلة في الأندلس"
                },
                {
                    title: "بناء قرطبة",
                    date: "756-788",
                    description: "حول قرطبة إلى عاصمة عظيمة وبدأ بناء مسجدها الكبير"
                },
                {
                    title: "الاستقرار السياسي",
                    date: "756-788",
                    description: "نجح في توحيد الأندلس وإرساء دعائم الحكم المستقر"
                }
            ],
            gallery: [
                {
                    image: "images/rulers/cordoba-mosque.jpg",
                    caption: "مسجد قرطبة"
                }
            ]
        },
        {
            id: 4,
            name: "المعز لدين الله الفاطمي",
            brief: "مؤسس القاهرة وناقل الخلافة الفاطمية إلى مصر",
            image: "images/rulers/al-muizz.jpg",
            bio: "المعز لدين الله الفاطمي (319-365هـ/932-975م) هو رابع الخلفاء الفاطميين ومؤسس القاهرة. نقل الخلافة من المغرب إلى مصر وأسس مدينة القاهرة.",
            achievements: [
                {
                    title: "تأسيس القاهرة",
                    date: "969",
                    description: "أمر ببناء مدينة القاهرة لتكون عاصمة الدولة الفاطمية"
                },
                {
                    title: "بناء الأزهر",
                    date: "970",
                    description: "أمر ببناء الجامع الأزهر ليكون منارة للعلم"
                },
                {
                    title: "توحيد الدولة",
                    date: "969-975",
                    description: "وحد مصر والشام تحت حكم الفاطميين"
                }
            ],
            gallery: [
                {
                    image: "images/rulers/cairo-muizz.jpg",
                    caption: "شارع المعز - القاهرة القديمة"
                }
            ]
        },
        {
            id: 5,
            name: "السلطان محمد الفاتح",
            brief: "فاتح القسطنطينية ومؤسس عصر جديد للدولة العثمانية",
            image: "images/rulers/mehmed.jpg",
            bio: "محمد الفاتح (833-886هـ/1429-1481م) هو السلطان العثماني الذي فتح القسطنطينية وحولها إلى إسطنبول. أسس عصراً جديداً من القوة والازدهار للدولة العثمانية.",
            achievements: [
                {
                    title: "فتح القسطنطينية",
                    date: "1453",
                    description: "نجح في فتح القسطنطينية وإنهاء الإمبراطورية البيزنطية"
                },
                {
                    title: "تطوير إسطنبول",
                    date: "1453-1481",
                    description: "حول المدينة إلى عاصمة إسلامية عظيمة وبنى جامع الفاتح"
                },
                {
                    title: "الإصلاح الإداري",
                    date: "1453-1481",
                    description: "طور النظام الإداري والقانوني للدولة العثمانية"
                }
            ],
            gallery: [
                {
                    image: "images/rulers/fatih-mosque.jpg",
                    caption: "جامع الفاتح"
                },
                {
                    image: "images/rulers/conquest.jpg",
                    caption: "فتح القسطنطينية"
                }
            ]
        },
        {
            id: 6,
            name: "السلطان بيبرس",
            brief: "قاهر المغول وحامي الديار المصرية",
            image: "images/rulers/baibars.jpg",
            bio: "الظاهر بيبرس (620-676هـ/1223-1277م) هو أحد أعظم سلاطين المماليك. هزم المغول في معركة عين جالوت وأسس دولة قوية.",
            achievements: [
                {
                    title: "معركة عين جالوت",
                    date: "1260",
                    description: "قاد الجيش المملوكي لهزيمة المغول في معركة حاسمة"
                },
                {
                    title: "تأمين الحدود",
                    date: "1260-1277",
                    description: "حصن الدولة وأقام نظام البريد السريع"
                },
                {
                    title: "العمارة والتطوير",
                    date: "1260-1277",
                    description: "بنى المساجد والقلاع وطور النظام الإداري"
                }
            ],
            gallery: [
                {
                    image: "images/rulers/baibars-mosque.jpg",
                    caption: "مسجد الظاهر بيبرس"
                }
            ]
        }
    ];

    // Create Rulers Cards
    function createRulersGrid() {
        const grid = document.querySelector('.rulers-grid');
        rulersData.forEach(ruler => {
            const card = document.createElement('div');
            card.className = 'ruler-card';
            card.innerHTML = `
                <img src="${ruler.image}" alt="${ruler.name}" class="ruler-image">
                <div class="ruler-info">
                    <h3 class="ruler-name">${ruler.name}</h3>
                    <p class="ruler-brief">${ruler.brief}</p>
                    <button class="ruler-more-btn" data-ruler-id="${ruler.id}">المزيد</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Create and Show Modal
    function showRulerModal(rulerId) {
        const ruler = rulersData.find(r => r.id === rulerId);
        if (!ruler) return;

        const modal = document.createElement('div');
        modal.className = 'ruler-modal';
        modal.innerHTML = `
            <div class="ruler-modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header" style="--ruler-image: url('${ruler.image}')">
                    <h2 class="modal-title">${ruler.name}</h2>
                </div>
                <div class="modal-body">
                    <p class="ruler-bio">${ruler.bio}</p>
                    
                    <h3>أهم الإنجازات</h3>
                    <ul class="achievements-list">
                        ${ruler.achievements.map(achievement => `
                            <li class="achievement-item">
                                <i class="fas fa-star"></i>
                                <div class="achievement-content">
                                    <h4>${achievement.title} (${achievement.date})</h4>
                                    <p>${achievement.description}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>

                    ${ruler.gallery.length ? `
                        <div class="ruler-gallery">
                            <h3>معرض الصور</h3>
                            <div class="gallery-grid">
                                ${ruler.gallery.map(item => `
                                    <div class="gallery-item">
                                        <img src="${item.image}" alt="${item.caption}">
                                        <div class="gallery-caption">${item.caption}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.style.display = 'block', 10);

        // Close Modal Events
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Initialize
    createRulersGrid();

    // Event Listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ruler-more-btn')) {
            const rulerId = parseInt(e.target.dataset.rulerId);
            showRulerModal(rulerId);
        }
    });
});