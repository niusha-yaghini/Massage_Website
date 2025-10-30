import React from 'react';
import styles from './Landing.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Landing = () => {
  return (
    <div className={styles.landing}>
      {/* هیرو سکشن */}
      <section className={`${styles.hero} ${styles.section}`}>
        <div className="container">
          <div className={`row align-items-center ${styles.heroContent}`}>
            <div className="col-lg-6">
              <h1 className={styles.heroTitle}>
                آرامش واقعی با ماساژ حرفه‌ای
              </h1>
              <p className={styles.heroSubtitle}>
                تجربه‌ای منحصر به فرد از ماساژ با بهترین متخصصان و محیطی آرامش‌بخش
              </p>
              <div className={styles.ctaButtons}>
                <button className={`btn ${styles.primaryBtn}`}>
                  رزرو نوبت
                </button>
                <button className={`btn ${styles.secondaryBtn}`}>
                  خدمات ما
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={styles.heroImage}>
                {/* جایگزین کن با عکس واقعی */}
                <div className={styles.placeholderImage}>
                  تصویر ماساژ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* خدمات */}
      <section className={`${styles.services} ${styles.section}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>خدمات ما</h2>
          <div className="row">
            <div className="col-md-4">
              <div className={styles.serviceCard}>
                <h3>ماساژ سوئدی</h3>
                <p>ماساژ کلاسیک برای ریلکس شدن عضلات و بهبود گردش خون</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.serviceCard}>
                <h3>ماساژ تایلندی</h3>
                <p>ترکیبی از کشش و فشار برای انعطاف‌پذیری بیشتر</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.serviceCard}>
                <h3>ماساژ ورزشی</h3>
                <p>مخصوص ورزشکاران برای بهبود عملکرد و ریکاوری</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* درباره ما */}
      <section className={`${styles.about} ${styles.section}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className={styles.aboutImage}>
                {/* جایگزین کن با عکس واقعی */}
                <div className={styles.placeholderImage}>
                  تصویر درباره ما
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className={styles.sectionTitle}>درباره مرکز ما</h2>
              <p className={styles.aboutText}>
                با سال‌ها تجربه در زمینه ماساژ درمانی، محیطی آرام و حرفه‌ای 
                برای شما عزیزان فراهم کرده‌ایم. استفاده از بهترین روغن‌ها 
                و متدهای روز دنیا از ویژگی‌های متمایز ماست.
              </p>
              <ul className={styles.featuresList}>
                <li>✅ متخصصان مجرب و certified</li>
                <li>✅ محیطی کاملاً استریل و بهداشتی</li>
                <li>✅ استفاده از تجهیزات مدرن</li>
                <li>✅ روغن‌های طبیعی و گیاهی</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;