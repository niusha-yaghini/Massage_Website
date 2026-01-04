import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";
import {
  FiHome,
  FiUser,
  FiStar,
  FiUsers,
  FiPhone,
  FiMail,
  FiLogIn,
  FiUserPlus,
  FiCalendar,
  FiVideo,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiMapPin,
  FiInstagram,
  FiSend,
  FiShield,
  FiGitBranch,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from "react-icons/fi";
import styles from "./Landing.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Logo from "../../assets/images/Logo_white.png";

const iconMap = {
  FiUser: FiUser,
  FiActivity: FiActivity,
  FiStar: FiStar,
  FiShield: FiShield,
};

const Landing = () => {
  // ============ Stateها ============
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // داده‌ها
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  // کاروسل خدمات
  const [currentService, setCurrentService] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // کاروسل نظرات
  const [currentReview, setCurrentReview] = useState(0);
  const [direction, setDirection] = useState("next");

  // ============ Debug Log ============
  console.log("Reviews from API:", reviews);

  // ============ Fetch Data ============
  // دریافت خدمات
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await userService.getAllServices();
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  // دریافت نظرات
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews from API...");
        const reviewsData = await userService.getAllReviews();

        if (Array.isArray(reviewsData)) {
          console.log("Reviews received from API:", reviewsData);
          setReviews(reviewsData);
        } else {
          console.error("Reviews data from API is not array:", reviewsData);
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews from API:", error);
        setReviews([]);
      }
    };

    fetchReviews();
  }, []);

  // ============ کاروسل نظرات ============
  const handleNextReview = () => {
    setDirection("next");
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setDirection("prev");
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // اتوماتیک چرخش کاروسل نظرات - فقط یک interval داشته باش!
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      handleNextReview();
    }, 5000); // هر 5 ثانیه

    return () => clearInterval(interval);
  }, [reviews.length]); // فقط وقتی reviews.length تغییر کرد، interval جدید بساز

  // ============ کاروسل خدمات ============
  const handleNextService = () => {
    setCurrentService((prev) => (prev + 1) % services.length);
  };

  const handlePrevService = () => {
    setCurrentService((prev) => (prev - 1 + services.length) % services.length);
  };

  // ============ Navigation & Scroll ============
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ["home", "services", "about", "reviews", "contact"];
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className={styles.landing}>
      {/* هدر */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <nav className={`${styles.nav}`}>
          <div className={styles.logo}>
            <img src={Logo} alt="فرشاد ماساژ" className={styles.logoImage} />
            <div className={styles.logoPulse}></div>
            <span className={styles.logospa}>فرشاد ماساژ</span>
          </div>

          <ul className={styles.navLinks}>
            {[
              { id: "home", label: "خانه", icon: <FiHome /> },
              { id: "services", label: "خدمات", icon: <FiUser /> },
              { id: "about", label: "درباره ما", icon: <FiStar /> },
              { id: "reviews", label: "نظرات", icon: <FiUsers /> },
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
            <Link
              to="/login"
              className={`${styles.loginBtn} ${styles.navLink}`}
            >
              <FiLogIn className={styles.btnIcon} />
              ورود
            </Link>
            <Link
              to="/signup"
              className={`${styles.signupBtn} ${styles.navLink}`}
            >
              <FiUserPlus className={styles.btnIcon} />
              ثبت‌نام
            </Link>
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
                در فرشاد ماساژ، با ترکیبی از هنر ماساژ سنتی و تکنیک‌های مدرن،
                سفری به دنیای آرامش و تندرستی را تجربه کنید
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/login" className={styles.primaryBtn}>
                  <FiCalendar className={styles.btnIcon} />
                  رزرو نوبت آنلاین
                </Link>
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
                      key={service.id}
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
                          {iconMap[service.icon] ? (
                            React.createElement(iconMap[service.icon])
                          ) : (
                            <FiUser />
                          )}
                        </div>

                        <h3>{service.name}</h3>
                        <p>{service.description}</p>
                        <span className={styles.priceMinimal}>
                          {service.price
                            ? new Intl.NumberFormat("fa-IR").format(
                                service.price
                              ) + " تومان"
                            : "۰ تومان"}
                        </span>
                        {isExpanded && (
                          <div className={styles.moreContent}>
                            <p>{service.description}</p>{" "}
                            <ul className={styles.moreList}>
                              <li>
                                مدت‌زمان:{" "}
                                {service.duration ||
                                  `${service.duration_minutes} دقیقه`}
                              </li>
                              <li>دسته‌بندی: {service.category || "عمومی"}</li>
                            </ul>
                          </div>
                        )}
                        <div className={styles.cardActionsRow}>
                          <Link to="/login" className={styles.bookBtnMinimal}>
                            <FiCalendar className={styles.btnIcon} />
                            رزرو نوبت
                          </Link>
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
                  چرا فرشاد ماساژ؟
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
      <section id="reviews" className={`${styles.reviews} ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>نظرات مشتریان</h2>
          <p className={styles.sectionSubtitle}>مشتریان ما چه می‌گویند؟</p>
        </div>

        {reviews.length > 0 ? (
          <>
            <div className={styles.carouselContainer}>
              <div className={styles.carousel}>
                {[currentReview - 1, currentReview, currentReview + 1].map(
                  (index, i) => {
                    const adjustedIndex =
                      (index + reviews.length) % reviews.length;
                    const review = reviews[adjustedIndex];
                    const position = i;

                    // اگر review وجود نداره
                    if (!review) return null;

                    return (
                      <div
                        key={`${review.id || adjustedIndex}-${position}`}
                        className={`
                  ${styles.reviewCard}
                  ${position === 1 ? styles.slideActive : ""}
                  ${position === 2 ? styles.slideIn : ""}
                  ${position === 0 ? styles.slideOut : ""}
                  ${
                    direction === "next"
                      ? styles.directionNext
                      : styles.directionPrev
                  }
                `}
                        data-position={position}
                      >
                        <div className={styles.reviewContent}>
                          <h4 className={styles.reviewName}>
                            {review.name || "مشتری ناشناس"}
                          </h4>
                          <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => {
                              const isFilled = i < (review.rating || 5);
                              return isFilled ? (
                                <FiStar key={i} className={styles.starFilled} />
                              ) : (
                                <FiStar key={i} className={styles.starEmpty} />
                              );
                            })}
                          </div>
                          <p className={styles.reviewText}>
                            {review.text || "بدون متن"}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className={styles.carouselControls}>
              <button
                className={`${styles.prevBtn} ${
                  direction === "prev" ? styles.activeNav : ""
                }`}
                onClick={handlePrevReview}
                aria-label="نظر قبلی"
              >
                <FiChevronRight />
              </button>

              {/* نشانگرهای دات */}
              <div className={styles.carouselDots}>
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${
                      index === currentReview ? styles.activeDot : ""
                    }`}
                    onClick={() => {
                      setDirection(index > currentReview ? "next" : "prev");
                      setCurrentReview(index);
                    }}
                    aria-label={`رفتن به نظر ${index + 1}`}
                  />
                ))}
              </div>

              <button
                className={`${styles.nextBtn} ${
                  direction === "next" ? styles.activeNav : ""
                }`}
                onClick={handleNextReview}
                aria-label="نظر بعدی"
              >
                <FiChevronLeft />
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
              backgroundColor: "#f9f9f9",
              borderRadius: "12px",
              margin: "20px auto",
              maxWidth: "600px",
            }}
          >
            <FiUsers
              style={{
                fontSize: "64px",
                marginBottom: "20px",
                opacity: 0.3,
                color: "#999",
              }}
            />
            <h4 style={{ marginBottom: "10px", color: "#555" }}>
              هنوز نظری ثبت نشده است
            </h4>
            <p style={{ fontSize: "16px", opacity: 0.7 }}>
              اولین نفری باشید که نظر می‌دهید!
            </p>
          </div>
        )}
      </section>

      {/* تماس */}
      <section id="contact" className={`${styles.contact} ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>آماده خدمات‌رسانی هستیم</h2>
            <p className={styles.sectionSubtitle}>
              برای رزرو نوبت یا مشاوره رایگان با ما در تماس باشید.
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
                        ارسال پیام
                      </h3>
                      <input
                        type="text"
                        placeholder="نام شما"
                        className={styles.formInput}
                      />
                      <input
                        type="tel"
                        placeholder="09123456789"
                        className={styles.formInput}
                      />
                      <textarea
                        placeholder="پیام شما ..."
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
            {/* ستون 1: درباره ما */}
            <div className="col-lg-3 col-md-6 mb-5">
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>
                  <FiHome className={styles.titleIcon} />
                  درباره فرشاد ماساژ
                </h4>
                <p className={styles.columnDescription}>
                  با بیش از ۱۰ سال تجربه در ارائه خدمات ماساژ درمانی و
                  آرامش‌بخشی، میزبان شما در محیطی لوکس و کاملاً حرفه‌ای هستیم.
                </p>
                <div className={styles.contactInfoMini}>
                  <div className={styles.contactItemMini}>
                    <FiPhone className={styles.contactIconMini} />
                    <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
                  </div>
                  <div className={styles.contactItemMini}>
                    <FiMapPin className={styles.contactIconMini} />
                    <span>تهران، ولیعصر، پلاک ۱۲۳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ستون 2: لینک‌های سریع */}
            <div className="col-lg-2 col-md-6 mb-5">
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>
                  <FiActivity className={styles.titleIcon} />
                  دسترسی سریع
                </h4>
                <ul className={styles.footerLinks}>
                  <li>
                    <a href="#home" className={styles.footerLink}>
                      <FiChevronLeft className={styles.linkIcon} />
                      صفحه اصلی
                    </a>
                  </li>
                  <li>
                    <a href="#services" className={styles.footerLink}>
                      <FiChevronLeft className={styles.linkIcon} />
                      خدمات ما
                    </a>
                  </li>
                  <li>
                    <a href="#about" className={styles.footerLink}>
                      <FiChevronLeft className={styles.linkIcon} />
                      درباره ما
                    </a>
                  </li>
                  <li>
                    <a href="#reviews" className={styles.footerLink}>
                      <FiChevronLeft className={styles.linkIcon} />
                      نظرات مشتریان
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className={styles.footerLink}>
                      <FiChevronLeft className={styles.linkIcon} />
                      تماس با ما
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* ستون 3: خدمات */}
            <div className="col-lg-3 col-md-6 mb-5">
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>
                  <FiStar className={styles.titleIcon} />
                  خدمات ویژه
                </h4>
                <ul className={styles.footerLinks}>
                  {services.slice(0, 5).map((service, index) => (
                    <li key={service.id}>
                      <a href="#services" className={styles.footerLink}>
                        <FiCheckCircle className={styles.linkIcon} />
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ستون 4: شبکه‌های اجتماعی و تماس */}
            <div className="col-lg-4 col-md-6 mb-5">
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>
                  <FiUsers className={styles.titleIcon} />
                  ما را دنبال کنید
                </h4>

                <div className={styles.socialSection}>
                  <div className={styles.socialLinksAdvanced}>
                    {[
                      {
                        icon: <FiInstagram />,
                        name: "اینستاگرام",
                        color: "#E4405F",
                        href: "#",
                      },
                      {
                        icon: <FiPhone />,
                        name: "واتساپ",
                        color: "#25D366",
                        href: "#",
                      },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className={styles.socialLinkAdvanced}
                        style={{ "--social-color": social.color }}
                        title={social.name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={styles.socialIconWrapper}>
                          {social.icon}
                        </div>
                        <span className={styles.socialTooltip}>
                          {social.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className={styles.businessHours}>
                  <h5>
                    <FiClock className={styles.titleIcon} />
                    ساعات کاری
                  </h5>
                  <div className={styles.hoursGrid}>
                    <div className={styles.hourItem}>
                      <span className={styles.day}>شنبه - چهارشنبه</span>
                      <span className={styles.time}>۸:۰۰ - ۲۲:۰۰</span>
                    </div>
                    <div className={styles.hourItem}>
                      <span className={styles.day}>پنج‌شنبه</span>
                      <span className={styles.time}>۸:۰۰ - ۲۰:۰۰</span>
                    </div>
                    <div className={styles.hourItem}>
                      <span className={styles.day}>جمعه</span>
                      <span className={styles.time}>۱۰:۰۰ - ۱۸:۰۰</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className={styles.copyright}>
                  <p>© ۱۴۰۳ فرشاد ماساژ. تمام حقوق محفوظ است.</p>
                </div>
              </div>
            </div>

            <button
              className={styles.backToTop}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="بازگشت به بالا"
            >
              <FiChevronUp />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
