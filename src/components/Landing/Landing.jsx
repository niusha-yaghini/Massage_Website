import React, { useState, useEffect } from 'react';
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
  // FiArrowLeft,
  // FiHeart,
  FiShield,
  // FiLeaf,
  FiGitBranch,
  FiActivity
} from 'react-icons/fi';
import styles from './Landing.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Logo from '../../assets/images/Logo.svg';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['home', 'services', 'about', 'therapists', 'contact'];
      const current = sections.find(section => {
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className={styles.landing}>
      {/* هدر */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <nav className={`${styles.nav}`}>
          
          {/* <div className={styles.logo}>
            <FiHeart className={styles.logoIcon} />
            
            <span>اسپا اکسیر</span>
          </div> */}

          <div className={styles.logo}>
            <img 
                src={Logo} 
                alt="اسپا اکسیر" 
                className={styles.logoImage}
              />
            <div className={styles.logoPulse}></div>
            <span>اسپا اکسیر</span>
          </div>


          <ul className={styles.navLinks}>
            {[
              { id: 'home', label: 'خانه', icon: <FiHome /> },
              { id: 'services', label: 'خدمات', icon: <FiUser /> },
              { id: 'about', label: 'درباره ما', icon: <FiStar /> },
              { id: 'therapists', label: 'متخصصان', icon: <FiUsers /> },
              { id: 'contact', label: 'تماس', icon: <FiPhone /> }
            ].map(item => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`} 
                  className={activeSection === item.id ? styles.active : ''}
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
            <button className={`btn ${styles.loginBtn}`}>
              <FiLogIn className={styles.btnIcon} />
              ورود
            </button>
            <button className={`btn ${styles.signupBtn}`}>
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
                بهترین مرکز ماساژ سال ۲۰۲۴
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
                <button className={`btn ${styles.primaryBtn}`}>
                  <FiCalendar className={styles.btnIcon} />
                  رزرو نوبت آنلاین
                </button>
                <button className={`btn ${styles.secondaryBtn}`}>
                  <FiVideo className={styles.btnIcon} />
                  ویدیو معرفی
                </button>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>۱,۲۵۰+</span>
                  <span className={styles.statLabel}>مشتری راضی</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>۱۸+</span>
                  <span className={styles.statLabel}>متخصص مجرب</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>۹۹%</span>
                  <span className={styles.statLabel}>رضایت‌مندی</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>۵<FiStar className={styles.starIcon} /></span>
                  <span className={styles.statLabel}>امتیاز گوگل</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={styles.heroVisual}>
                <div className={styles.floatingCard}>
                  <FiUser className={styles.cardIcon} />
                  <span>ماساژ تخصصی</span>
                </div>
                <div className={styles.floatingCard}>
                  <FiGitBranch className={styles.cardIcon} />
                  <span>روغن‌های طبیعی</span>
                </div>
                <div className={styles.floatingCard}>
                  <FiAward className={styles.cardIcon} />
                  <span>کیفیت عالی</span>
                </div>
                <div className={styles.mainHeroImage}>
                  <div className={styles.imageContent}>
                    <div className={styles.rating}>
                      <span>۵.۰</span>
                      <div className={styles.stars}>
                        <FiStar />
                        <FiStar />
                        <FiStar />
                        <FiStar />
                        <FiStar />
                      </div>
                    </div>
                    <h4>تجربه‌ای فراموش‌نشدنی</h4>
                    <p>در محیطی آرام و لوکس</p>
                  </div>
                </div>
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
          <div className="row">
            {[
              {
                icon: <FiUser />,
                title: 'ماساژ سوئدی',
                description: 'ماساژ کلاسیک برای ریلکس شدن عضلات، بهبود گردش خون و کاهش استرس روزانه',
                price: '۱۸۰,۰۰۰ تومان',
                duration: '۶۰ دقیقه',
                features: ['رفع خستگی عضلات', ' بهبود گردش خون', 'کاهش استرس']
              },
              {
                icon: <FiActivity />,
                title: 'ماساژ تایلندی',
                description: 'ترکیبی منحصربه‌فرد از کشش یوگا و فشار برای انعطاف‌پذیری و انرژی بیشتر',
                price: '۲۲۰,۰۰۰ تومان',
                duration: '۷۵ دقیقه',
                features: ['انعطاف‌پذیری بیشتر', 'انرژی‌بخشی', 'کشش عضلات']
              },
              {
                icon: <FiActivity />,
                title: 'ماساژ ورزشی',
                description: 'مخصوص ورزشکاران حرفه‌ای برای بهبود عملکرد، ریکاوری و جلوگیری از آسیب',
                price: '۲۰۰,۰۰۰ تومان',
                duration: '۶۰ دقیقه',
                features: ['ریکاوری سریع', 'جلوگیری از آسیب', 'بهبود عملکرد']
              }
            ].map((service, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className={`${styles.serviceCard} ${styles[`card${index + 1}`]}`}>
                  <div className={styles.serviceHeader}>
                    <div className={styles.serviceIcon}>{service.icon}</div>
                    <div className={styles.serviceInfo}>
                      <h3>{service.title}</h3>
                      <span className={styles.duration}>
                        <FiClock className={styles.clockIcon} />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <div className={styles.serviceFeatures}>
                    {service.features.map((feature, idx) => (
                      <span key={idx} className={styles.featureTag}>
                        <FiCheckCircle className={styles.checkIcon} />
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className={styles.serviceFooter}>
                    <span className={styles.price}>{service.price}</span>
                    <button className={styles.bookBtn}>
                      <FiCalendar className={styles.btnIcon} />
                      رزرو نوبت
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  تجربه‌ای <span className={styles.highlight}>منحصربه‌فرد</span> از آرامش
                </h2>
                <p className={styles.aboutText}>
                  با <strong>۱۰ سال تجربه درخشان</strong> در زمینه ماساژ درمانی، محیطی آرام، 
                  لوکس و کاملاً حرفه‌ای برای شما عزیزان فراهم کرده‌ایم. استفاده از بهترین 
                  روغن‌های طبیعی و متدهای روز دنیا از ویژگی‌های متمایز ماست.
                </p>
                <div className={styles.featuresGrid}>
                  {[
                    { icon: <FiAward />, title: 'متخصصان certified', desc: 'دارای گواهینامه‌های بین‌المللی' },
                    { icon: <FiShield />, title: 'محیط استریل', desc: 'رعایت کامل پروتکل‌های بهداشتی' },
                    { icon: <FiActivity />, title: 'تجهیزات مدرن', desc: 'استفاده از جدیدترین متدها' },
                    { icon: <FiGitBranch />, title: 'روغن‌های طبیعی', desc: '۱۰۰% گیاهی و ارگانیک' }
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

      {/* متخصصان */}
      <section id="therapists" className={`${styles.therapists} ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>با متخصصان ما آشنا شوید</h2>
            <p className={styles.sectionSubtitle}>
              تیم حرفه‌ای ما با سال‌ها تجربه در زمینه ماساژ درمانی در خدمت شماست
            </p>
          </div>
          <div className="row">
            {[
              { name: 'دکتر مریم احمدی', specialty: 'ماساژ سوئدی', exp: '۸ سال', bio: 'متخصص ماساژ درمانی با ۸ سال سابقه درخشان' },
              { name: 'دکتر علی رضایی', specialty: 'ماساژ ورزشی', exp: '۶ سال', bio: 'مختصص ماساژ ورزشی و ریکاوری' },
              { name: 'دکتر سارا محمدی', specialty: 'ماساژ تایلندی', exp: '۱۰ سال', bio: 'استاد ماساژ تایلندی و انرژی درمانی' },
              { name: 'دکتر محسن کریمی', specialty: 'ماساژ درمانی', exp: '۱۲ سال', bio: 'پیشگوت در زمینه ماساژ درمانی تخصصی' }
            ].map((therapist, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className={styles.therapistCard}>
                  <div className={styles.therapistImage}>
                    <FiUser className={styles.therapistAvatar} />
                    <div className={styles.expBadge}>{therapist.exp}</div>
                  </div>
                  <div className={styles.therapistInfo}>
                    <h4>{therapist.name}</h4>
                    <p className={styles.specialty}>{therapist.specialty}</p>
                    <p className={styles.bio}>{therapist.bio}</p>
                    <div className={styles.therapistActions}>
                      <button className={styles.profileBtn}>
                        <FiUser className={styles.btnIcon} />
                        پروفایل
                      </button>
                      <button className={styles.bookingBtn}>
                        <FiCalendar className={styles.btnIcon} />
                        رزرو
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                          <input type="text" placeholder="نام شما" className={styles.formInput} />
                        </div>
                        <div className="col-md-6">
                          <input type="tel" placeholder="شماره تماس" className={styles.formInput} />
                        </div>
                      </div>
                      <input type="email" placeholder="ایمیل (اختیاری)" className={styles.formInput} />
                      <textarea placeholder="پیام شما..." rows="4" className={styles.formTextarea}></textarea>
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
              
              {/* <div className={styles.footerLogo}>
                <FiHeart className={styles.logoIcon} />
                <span>اسپا اکسیر</span>
              </div> */}

              <div className={styles.footerLogo}>
                <img 
                  src="/images/logo.png" 
                  alt="اسپا اکسیر" 
                  className={styles.logoImage}
                />
                <span>اسپا اکسیر</span>
              </div>

              <p className={styles.footerDescription}>
                مرکز تخصصی ماساژ و اسپا با ارائه بهترین خدمات در محیطی آرام و لوکس
              </p>
              <div className={styles.socialLinks}>
                {[
                  { icon: <FiFacebook />, name: 'Facebook' },
                  { icon: <FiInstagram />, name: 'Instagram' },
                  { icon: <FiTwitter />, name: 'Twitter' },
                  { icon: <FiYoutube />, name: 'YouTube' }
                ].map((social, index) => (
                  <a key={index} href="#" className={styles.socialLink} title={social.name}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h4>لینک‌های سریع</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#home">خانه</a></li>
                <li><a href="#services">خدمات</a></li>
                <li><a href="#about">درباره ما</a></li>
                <li><a href="#therapists">متخصصان</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-4 mb-4">
              <h4>خدمات</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#">ماساژ سوئدی</a></li>
                <li><a href="#">ماساژ تایلندی</a></li>
                <li><a href="#">ماساژ ورزشی</a></li>
                <li><a href="#">ماساژ درمانی</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-4 mb-4">
              <h4>خبرنامه</h4>
              <p>برای دریافت تخفیف‌های ویژه در خبرنامه عضو شوید</p>
              <div className={styles.newsletter}>
                <input type="email" placeholder="ایمیل شما" className={styles.newsletterInput} />
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