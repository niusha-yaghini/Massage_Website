import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiUser,
  FiStar,
  FiUsers,
  FiPhone,
  FiLogIn,
  FiUserPlus,
  FiCalendar,
  FiVideo,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiMail,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiSend,
  FiShield,
  FiGitBranch,
  FiActivity,
} from "react-icons/fi";
import styles from "./Landing.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Logo from "../../assets/images/Logo_white.png";
import Logobackback from "../../assets/images/back7-2.jpg";

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const services = [
    {
      icon: <FiUser />,
      title: "ماساژ سوئدی",
      description: "ماساژ کلاسیک برای ریلکس شدن عضلات",
      price: "۱,۸۰۰,۰۰۰ تومان",
    },
    {
      icon: <FiActivity />,
      title: "ماساژ تایلندی",
      description: "کشش یوگا و تکنیک‌های انرژی‌بخش",
      price: "۲,۲۰۰,۰۰۰ تومان",
    },
    {
      icon: <FiActivity />,
      title: "ماساژ ورزشی",
      description: "مخصوص ورزشکاران حرفه‌ای",
      price: "۲,۰۰۰,۰۰۰ تومان",
    },
    {
      icon: <FiUser />,
      title: "ماساژ آرام‌سازی",
      description: "ریلکسیشن عمیق با روغن‌های ارگانیک",
      price: "۱,۹۰۰,۰۰۰ تومان",
    },
    {
      icon: <FiStar />,
      title: "ماساژ درمانی",
      description: "درمان دردهای عضلانی و گرفتگی‌ها",
      price: "۲,۴۰۰,۰۰۰ تومان",
    },
    {
      icon: <FiShield />,
      title: "ماساژ VIP",
      description: "لوکس‌ترین پکیج همراه با رایحه‌درمانی",
      price: "۳,۰۰۰,۰۰۰ تومان",
    },
  ];

  const [currentService, setCurrentService] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleNextService = () => {
    setCurrentService((prev) => (prev + 1) % services.length);
  };

  const handlePrevService = () => {
    setCurrentService((prev) => (prev - 1 + services.length) % services.length);
  };

  const testimonials = [
    {
      name: "امیر رضایی",
      avatar: <FiUser />,
      text: "یکی از بهترین تجربه‌های اسپا که داشتم. محیط فوق‌العاده آرام، عطر عالی و رفتار بسیار محترمانه پرسنل.",
    },
    {
      name: "مهدی احمدپور",
      avatar: <FiUser />,
      text: "بعد از یک هفته کاری شلوغ، اینجا دقیقاً همان جایی است که برای ریلکس شدن نیاز دارم.",
    },
    {
      name: "محمد طاهری",
      avatar: <FiUser />,
      text: "ماساژ درمانی واقعاً درد کمرم رو کاهش داد. حس کردم بدنم دوباره جان گرفت.",
    },
    {
      name: "حسین سلطانی",
      avatar: <FiUser />,
      text: "فضا لاکچری، موسیقی آرام، و ماساژ حرفه‌ای. حتماً به دوستانم پیشنهاد می‌دم.",
    },
    {
      name: "علی محمدی",
      avatar: <FiUser />,
      text: "رزرو آنلاین خیلی راحت بود و سر زمان تعیین‌شده بدون معطلی پذیرش شدم. تجربه‌ی فوق‌العاده‌ای بود.",
    },
    {
      name: "رضا کرمانی",
      avatar: <FiUser />,
      text: "کیفیت ماساژ و برخورد پرسنل باعث شد اینجا رو به‌عنوان محل ثابت استراحتم انتخاب کنم.",
    },
    {
      name: "سعید کریمی",
      avatar: <FiUser />,
      text: "بهترین ماساژی که تجربه کردم! پرسنل بسیار حرفه‌ای و محیط فوق‌العاده آرام.",
    },
    {
      name: "عباس موسوی",
      avatar: <FiUser />,
      text: "برای هدیه تولد همسرم آوردمش اینجا، خیلی خوشش اومد. ممنون از خدمات عالیتون.",
    },
    {
      name: "ناصر رضوانی",
      avatar: <FiUser />,
      text: "بعد از یک ماه کار سخت، این ماساژ واقعاً معجزه کرد. انرژی گرفتم برای هفته جدید.",
    },
    {
      name: "علی احمدی",
      avatar: <FiUser />,
      text: "روغن‌های طبیعی و بوی خوبش واقعاً آرامش‌بخش بود. حتماً دوباره می‌آیم.",
    },
    {
      name: "محسن جعفری",
      avatar: <FiUser />,
      text: "توصیه دکترم بود برای کمردرد، واقعاً مؤثر بود. سه جلسه رفتم درد خیلی بهتر شد.",
    },
    {
      name: "حسین سلیمانی",
      avatar: <FiUser />,
      text: "برخورد پرسنل خیلی محترمانه بود. احساس امنیت و آرامش کامل داشتم.",
    },
    {
      name: "کامران نوروزی",
      avatar: <FiUser />,
      text: "قیمت مناسبی داره نسبت به کیفیت خدمات. جای دیگه رو توصیه نمی‌کنم.",
    },
    {
      name: "خسن حیدری",
      avatar: <FiUser />,
      text: "ماساژ سوئدی عالی بود. متخصص واقعاً حرفه‌ای کار کرد. ممنونم.",
    },
    {
      name: "پویا مرادی",
      avatar: <FiUser />,
      text: "امکانات سالن خیلی خوبه. دوش آب گرم بعد ماساژ واقعاً لذت‌بخش بود.",
    },
  ];

  // State برای کاروسل نظرات
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // تنظیمات کاروسل
  const visibleTestimonials = 5;
  const infiniteTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];
  const trackWidth = (100 / visibleTestimonials) * testimonials.length * 3;

  // useEffect برای auto-play کاروسل
  useEffect(() => {
    let interval;

    if (!isHovered) {
      interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, testimonials.length]);

  // useEffect برای تشخیص اسکرول و active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ["home", "services", "about", "therapists", "contact"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // توابع navigation
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // تابع برای رفتن به کارت بعدی در نظرات
  const goToNextTestimonial = () => {
    setIsTransitioning(true);
    setCurrentTestimonial((prev) => {
      if (prev >= testimonials.length - 1) {
        setTimeout(() => {
          setCurrentTestimonial(0);
          setIsTransitioning(false);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 800);
        return prev;
      }
      return prev + 1;
    });
  };

  // تابع برای رفتن به کارت قبلی در نظرات
  const goToPrevTestimonial = () => {
    setIsTransitioning(true);
    setCurrentTestimonial((prev) => {
      if (prev <= 0) {
        setTimeout(() => {
          setCurrentTestimonial(testimonials.length - 1);
          setIsTransitioning(false);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 800);
        return prev;
      }
      return prev - 1;
    });
  };

  return (
    <div className={styles.landing}>
      {/* هدر */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <nav className={`${styles.nav}`}>
          <div className={styles.logo}>
            <img src={Logo} alt="اسپا اکسیر" className={styles.logoImage} />
            <div className={styles.logoPulse}></div>
            <span className={styles.logospa}>اسپا اکسیر</span>
          </div>

          <ul className={styles.navLinks}>
            {[
              { id: "home", label: "خانه", icon: <FiHome /> },
              { id: "services", label: "خدمات", icon: <FiUser /> },
              { id: "about", label: "درباره ما", icon: <FiStar /> },
              { id: "therapists", label: "متخصصان", icon: <FiUsers /> },
              { id: "contact", label: "تماس", icon: <FiPhone /> },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeSection === item.id ? styles.active : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.headerButtons}>
            <button className={` ${styles.loginBtn}`}>
              <FiLogIn className={styles.btnIcon} />
              ورود
            </button>
            <button className={` ${styles.signupBtn}`}>
              <FiUserPlus className={styles.btnIcon} />
              ثبت‌نام
            </button>
          </div>
        </nav>
      </header>

      {/* هیرو سکشن */}
      <section id="home" className={`${styles.hero} ${styles.section}`}>
        <div className="container">
          <div className={`row align-items-center ${styles.heroContent}`}>
            <div className="col-lg-6">
              <div className={styles.heroBadge}>
                <FiAward className={styles.badgeIcon} />
                با بیش از 3 سال تجربه
              </div>
              <h1 className={styles.heroTitle}>
                آرامش <span className={styles.highlight}>اصیل</span> در
                <span className={styles.highlight}> محیطی لوکس</span>
              </h1>
              <p className={styles.heroSubtitle}>
                در اسپا اکسیر، با ترکیبی از هنر ماساژ سنتی و تکنیک‌های مدرن،
                سفری به دنیای آرامش و تندرستی را تجربه کنید
              </p>
              <div className={styles.ctaButtons}>
                <button className={` ${styles.primaryBtn}`}>
                  <FiCalendar className={styles.btnIcon} />
                  رزرو نوبت آنلاین
                </button>
                <button className={` ${styles.secondaryBtn}`}>
                  <FiVideo className={styles.btnIcon} />
                  ویدیو معرفی
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* خدمات */}
      <section id="services" className={`${styles.services} ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>خدمات اختصاصی ما</h2>
            <p className={styles.sectionSubtitle}>
              با متنوع‌ترین و تخصصی‌ترین خدمات ماساژ در خدمت شما هستیم
            </p>
          </div>

          <div className={styles.sliderWrapper}>
            <button className={styles.navBtn} onClick={handlePrevService}>
              ‹
            </button>

            <div className={styles.slider}>
              <div className={styles.sliderInner}>
                {services.map((service, index) => {
                  const total = services.length;

                  let offset = index - currentService;

                  if (offset > total / 2) {
                    offset -= total;
                  } else if (offset < -total / 2) {
                    offset += total;
                  }

                  const isActive = offset === 0;
                  const isSide = Math.abs(offset) === 1;
                  const isFar = Math.abs(offset) > 1;
                  const isExpanded = expandedIndex === index;

                  return (
                    <div
                      key={index}
                      className={`
        ${styles.slide}
        ${isActive ? styles.activeSlide : ""}
        ${isSide ? styles.sideSlide : ""}
        ${isFar ? styles.farSlide : ""}
      `}
                      style={{
                        transform: `translate(calc(-50% + ${
                          offset * 35
                        }%), -50%) scale(${isActive ? 1 : 0.9})`,
                        zIndex: 10 - Math.abs(offset),
                      }}
                    >
                      <div
                        className={`
          ${styles.serviceCardMinimal}
          ${isActive ? styles.activeCard : ""}
          ${isExpanded ? styles.expandedCard : ""}
        `}
                      >
                        <div className={styles.serviceIconMinimal}>
                          {service.icon}
                        </div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <span className={styles.priceMinimal}>
                          {service.price}
                        </span>

                        {isExpanded && (
                          <div className={styles.moreContent}>
                            <p>
                              این ماساژ شامل مدت‌زمان بیشتر، استفاده از روغن‌های
                              ویژه و تمرکز روی نواحی حساس بدن است تا حداکثر
                              آرامش را برای شما فراهم کند.
                            </p>
                            <ul className={styles.moreList}>
                              <li>مدت‌زمان تقریبی: ۶۰ تا ۹۰ دقیقه</li>
                              <li>استفاده از روغن‌های ۱۰۰٪ گیاهی</li>
                              <li>مشاوره کوتاه قبل از شروع ماساژ</li>
                            </ul>
                          </div>
                        )}

                        <div className={styles.cardActionsRow}>
                          <button className={styles.bookBtnMinimal}>
                            <FiCalendar className={styles.btnIcon} />
                            رزرو نوبت
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className={styles.navBtn} onClick={handleNextService}>
              ›
            </button>
          </div>
        </div>
      </section>

      {/* درباره ما */}
      <section id="about" className={`${styles.about} ${styles.section}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className={styles.aboutVisual}>
                <div className={styles.mainAboutImage}>
                  <div className={styles.imageBadge}>
                    <span>۱۰+ سال</span>
                    <small>تجربه موفق</small>
                  </div>
                </div>
                <div className={styles.statsOverlay}>
                  <div className={styles.overlayStat}>
                    <span>۵۰+</span>
                    <small>نوع خدمات</small>
                  </div>
                  <div className={styles.overlayStat}>
                    <span>۱۰۰%</span>
                    <small>رضایت مشتری</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={styles.aboutContent}>
                <div className={styles.sectionBadge}>
                  <FiStar className={styles.badgeIcon} />
                  چرا اسپا اکسیر؟
                </div>
                <h2 className={styles.sectionTitle}>
                  تجربه‌ای <span className={styles.highlight}>منحصربه‌فرد</span>{" "}
                  از آرامش
                </h2>
                <p className={styles.aboutText}>
                  با <strong>۱۰ سال تجربه درخشان</strong> در زمینه ماساژ درمانی،
                  محیطی آرام، لوکس و کاملاً حرفه‌ای برای شما عزیزان فراهم
                  کرده‌ایم. استفاده از بهترین روغن‌های طبیعی و متدهای روز دنیا
                  از ویژگی‌های متمایز ماست.
                </p>
                <div className={styles.featuresGrid}>
                  {[
                    {
                      icon: <FiAward />,
                      title: "متخصصان certified",
                      desc: "دارای گواهینامه‌های بین‌المللی",
                    },
                    {
                      icon: <FiShield />,
                      title: "محیط استریل",
                      desc: "رعایت کامل پروتکل‌های بهداشتی",
                    },
                    {
                      icon: <FiActivity />,
                      title: "تجهیزات مدرن",
                      desc: "استفاده از جدیدترین متدها",
                    },
                    {
                      icon: <FiGitBranch />,
                      title: "روغن‌های طبیعی",
                      desc: "۱۰۰% گیاهی و ارگانیک",
                    },
                  ].map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div className={styles.featureIcon}>{feature.icon}</div>
                      <div className={styles.featureContent}>
                        <h4>{feature.title}</h4>
                        <p>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* نظرات مشتریان */}
      {/* نظرات مشتریان */}
      <section
        id="testimonials"
        className={`${styles.testimonials} ${styles.section}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>نظرات مشتریان</h2>
            <p className={styles.sectionSubtitle}>
              تجربه‌ی صدها مشتری راضی از خدمات اسپا اکسیر
            </p>
          </div>

          <div className={styles.testimonialSliderWrapper}>
            <div className={styles.testimonialTrackContainer}>
              <div
                className={styles.testimonialTrack}
                style={{
                  transform: `translateX(-${currentTestimonial * (100 / 3)}%)`, // تغییر: نمایش 3 تا در هر صفحه
                  transition: isTransitioning ? "transform 0.5s ease" : "none",
                  width: `${(testimonials.length / 3) * 100}%`, // تغییر: عرض بر اساس تعداد صفحات
                }}
              >
                {testimonials.map((item, index) => (
                  <div key={index} className={styles.testimonialItem}>
                    <div className={styles.testimonialCard}>
                      <div className={styles.testimonialAvatar}>
                        {item.avatar}
                      </div>
                      <h4 className={styles.testimonialName}>{item.name}</h4>
                      <p className={styles.testimonialText}>{item.text}</p>
                      <div className={styles.testimonialRating}>
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <FiStar key={i} className={styles.starIcon} />
                          ))}
                      </div>
                      <div className={styles.testimonialNumber}>
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.testimonialControls}>
            <button
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setCurrentTestimonial((prev) =>
                  prev === 0
                    ? Math.floor((testimonials.length - 1) / 3)
                    : prev - 1
                );
              }}
              className={styles.controlBtn}
              aria-label="نظر قبلی"
            >
              ‹
            </button>

            <div className={styles.testimonialDots}>
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentTestimonial(index);
                    }}
                    className={`${styles.dot} ${
                      currentTestimonial === index ? styles.activeDot : ""
                    }`}
                    aria-label={`برو به صفحه ${index + 1}`}
                  />
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setCurrentTestimonial((prev) =>
                  prev >= Math.floor((testimonials.length - 1) / 3)
                    ? 0
                    : prev + 1
                );
              }}
              className={styles.controlBtn}
              aria-label="نظر بعدی"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* تماس */}
      <section id="contact" className={`${styles.contact} ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>آماده خدمات‌رسانی هستیم</h2>
            <p className={styles.sectionSubtitle}>
              برای رزرو نوبت یا مشاوره رایگان با ما در تماس باشید
            </p>
          </div>
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className={styles.contactCard}>
                <div className="row">
                  <div className="col-md-5">
                    <div className={styles.contactInfo}>
                      <h3>
                        <FiPhone className={styles.sectionIcon} />
                        اطلاعات تماس
                      </h3>
                      <div className={styles.contactItem}>
                        <FiPhone className={styles.contactIcon} />
                        <div>
                          <strong>تلفن:</strong>
                          <p>۰۲۱-۱۲۳۴۵۶۷۸</p>
                        </div>
                      </div>
                      <div className={styles.contactItem}>
                        <FiPhone className={styles.contactIcon} />
                        <div>
                          <strong>موبایل:</strong>
                          <p>۰۹۱۲۳۴۵۶۷۸۹</p>
                        </div>
                      </div>
                      <div className={styles.contactItem}>
                        <FiMapPin className={styles.contactIcon} />
                        <div>
                          <strong>آدرس:</strong>
                          <p>تهران، خیابان ولیعصر، پلاک ۱۲۳</p>
                        </div>
                      </div>
                      <div className={styles.contactItem}>
                        <FiClock className={styles.contactIcon} />
                        <div>
                          <strong>ساعات کاری:</strong>
                          <p>۸ صبح تا ۱۰ شب</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className={styles.contactForm}>
                      <h3>
                        <FiMail className={styles.sectionIcon} />
                        ارسال پیام سریع
                      </h3>
                      <div className="row">
                        <div className="col-md-6">
                          <input
                            type="text"
                            placeholder="نام شما"
                            className={styles.formInput}
                          />
                        </div>
                        <div className="col-md-6">
                          <input
                            type="tel"
                            placeholder="شماره تماس"
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                      <input
                        type="email"
                        placeholder="ایمیل (اختیاری)"
                        className={styles.formInput}
                      />
                      <textarea
                        placeholder="پیام شما..."
                        rows="4"
                        className={styles.formTextarea}
                      ></textarea>
                      <button className={`btn ${styles.primaryBtn}`}>
                        <FiSend className={styles.btnIcon} />
                        ارسال پیام
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer className={styles.footer}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className={styles.footerLogo}>
                <img
                  src="/images/logo.png"
                  alt="اسپا اکسیر"
                  className={styles.logoImage}
                />
                <span>اسپا اکسیر</span>
              </div>

              <p className={styles.footerDescription}>
                مرکز تخصصی ماساژ و اسپا با ارائه بهترین خدمات در محیطی آرام و
                لوکس
              </p>
              <div className={styles.socialLinks}>
                {[
                  { icon: <FiFacebook />, name: "Facebook" },
                  { icon: <FiInstagram />, name: "Instagram" },
                  { icon: <FiTwitter />, name: "Twitter" },
                  { icon: <FiYoutube />, name: "YouTube" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={styles.socialLink}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h4>لینک‌های سریع</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="#home">خانه</a>
                </li>
                <li>
                  <a href="#services">خدمات</a>
                </li>
                <li>
                  <a href="#about">درباره ما</a>
                </li>
                <li>
                  <a href="#therapists">متخصصان</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-4 mb-4">
              <h4>خدمات</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="#">ماساژ سوئدی</a>
                </li>
                <li>
                  <a href="#">ماساژ تایلندی</a>
                </li>
                <li>
                  <a href="#">ماساژ ورزشی</a>
                </li>
                <li>
                  <a href="#">ماساژ درمانی</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-4 mb-4">
              <h4>خبرنامه</h4>
              <p>برای دریافت تخفیف‌های ویژه در خبرنامه عضو شوید</p>
              <div className={styles.newsletter}>
                <input
                  type="email"
                  placeholder="ایمیل شما"
                  className={styles.newsletterInput}
                />
                <button className={styles.newsletterBtn}>
                  <FiSend className={styles.btnIcon} />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© ۲۰۲۴ اسپا اکسیر. تمام حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
