import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import { userService } from "../../services/userService";
import styles from "./Dashboard.module.css";

const Booking = ({
  massageTypes,
  onBookingSuccess,
  initialData = null,
  isEditing = false,
  editingAppointmentId = null,
}) => {
  console.log("🎯 Booking component rendered with props:", {
    isEditing,
    editingAppointmentId,
    initialData,
    massageTypesLength: massageTypes?.length,
  });

  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    selectedMassage: initialData?.selectedMassage || null,
    selectedDate: initialData?.selectedDate || "",
    selectedTime: initialData?.selectedTime || "",
    notes: initialData?.notes || "",
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State برای هفته جاری
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [displayDates, setDisplayDates] = useState([]);

  useEffect(() => {
    console.log(
      "🔄 Booking useEffect - isEditing:",
      isEditing,
      "initialData:",
      initialData
    );
    if (isEditing && initialData) {
      console.log("✏️ Setting booking step to 2 for editing");
      setBookingStep(2);
    }
  }, [isEditing, initialData]);

  // بارگذاری تاریخ‌های available (فقط یک بار)
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        const response = await userService.getAvailableSlots();
        if (response.success) {
          setAvailableDates(response.available_dates || []);
          setAllSlots(response.all_slots || []);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  // تولید تاریخ‌های ۲ هفته با قابلیت جابجایی هفته
  useEffect(() => {
    const generateDates = () => {
      const dates = [];
      const today = new Date();

      // شروع از امروز
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + currentWeekOffset * 7);

      // ۱۴ روز از تاریخ شروع
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dateStr = date.toISOString().split("T")[0];
        const isToday = i === 0 && currentWeekOffset === 0;

        // پیدا کردن اطلاعات available از API
        const availableInfo = availableDates.find((d) => d.date === dateStr);
        const actualAvailableSlots = availableInfo?.available_slots || allSlots;

        // برای امروز، ساعت‌های معتبر را فیلتر کن
        let validSlots = actualAvailableSlots;
        if (isToday) {
          validSlots = actualAvailableSlots.filter((time) =>
            isTimeValidForToday(time, dateStr)
          );
        }

        dates.push({
          date: dateStr,
          display: date.toLocaleDateString("fa-IR", {
            month: "long",
            day: "numeric",
          }),
          dayName: date.toLocaleDateString("fa-IR", { weekday: "long" }),
          dayNumber: date.getDate(),
          month: date.getMonth(),
          isToday: isToday,
          isAvailable: validSlots.length > 0,
          availableSlots: actualAvailableSlots,
        });
      }

      setDisplayDates(dates);
    };

    generateDates();
  }, [currentWeekOffset, availableDates, allSlots]);

  // بررسی اینکه ساعت انتخاب شده از ۱ ساعت آینده باشد (برای امروز)
  const isTimeValidForToday = (time, dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    if (dateStr !== today) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [hour, minute] = time.split(":").map(Number);

    // اگر ساعت بزرگتر از ساعت فعلی باشد
    if (hour > currentHour) return true;
    // اگر ساعت برابر است، باید دقیقه از ۱ ساعت آینده باشد
    if (hour === currentHour) {
      return minute >= currentMinute + 60;
    }
    return false;
  };

  const getAvailableSlotsForDate = (dateStr) => {
    const dateInfo = availableDates.find((d) => d.date === dateStr);
    let slots = dateInfo?.available_slots || allSlots;

    console.log(`🔍 Date: ${dateStr}, DateInfo:`, dateInfo);
    console.log(`🔍 Available slots for ${dateStr}:`, slots);

    const today = new Date().toISOString().split("T")[0];
    if (dateStr === today) {
      slots = slots.filter((time) => isTimeValidForToday(time, dateStr));
    }

    return slots;
  };

  const handleBookingChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📝 Submitting with:", {
        isEditing,
        editingAppointmentId,
        selectedDate: bookingData.selectedDate,
        selectedTime: bookingData.selectedTime,
        notes: bookingData.notes,
        selectedMassage: bookingData.selectedMassage,
      });

      if (isEditing && editingAppointmentId) {
        const updateData = {
          appointment_date: bookingData.selectedDate,
          appointment_time: bookingData.selectedTime,
          notes: bookingData.notes,
        };

        console.log(
          "🔄 Updating appointment:",
          editingAppointmentId,
          updateData
        );

        if (!userService.updateAppointment) {
          console.error("❌ userService.updateAppointment is not defined!");
          throw new Error("تابع آپدیت نوبت در سرویس وجود ندارد");
        }

        await userService.updateAppointment(editingAppointmentId, updateData);
        alert("زمان نوبت با موفقیت تغییر کرد!");
      } else {
        const appointmentData = {
          service_id: bookingData.selectedMassage.id,
          appointment_date: bookingData.selectedDate,
          appointment_time: bookingData.selectedTime,
          notes: bookingData.notes,
          price: bookingData.selectedMassage.price,
        };

        console.log("📅 Creating new appointment:", appointmentData);
        await userService.bookAppointment(appointmentData);

        // ✅ بعد از رزرو موفق، دوباره تاریخ‌های available را دریافت کن
        const response = await userService.getAvailableSlots();
        if (response.success) {
          console.log(
            "📅 Available dates after booking:",
            response.available_dates
          );
          console.log("📅 All slots after booking:", response.all_slots);
          setAvailableDates((prev) => {
            console.log("Old availableDates:", prev);
            console.log("New availableDates:", response.available_dates);
            return response.available_dates || [];
          });
          setAllSlots(response.all_slots || []);
          setCurrentWeekOffset(0);
        }

        alert("نوبت با موفقیت رزرو شد!");
      }

      setBookingStep(1);
      setBookingData({
        selectedMassage: null,
        selectedDate: "",
        selectedTime: "",
        notes: "",
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      setError(error.message || "خطا در انجام عملیات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlots = () => {
    if (!bookingData.selectedDate) {
      return (
        <div className={styles.timePlaceholder}>
          <FiInfo className={styles.infoIcon} />
          <p>لطفا ابتدا تاریخ را انتخاب کنید</p>
        </div>
      );
    }

    const availableSlots = getAvailableSlotsForDate(bookingData.selectedDate);

    console.log(
      "🔍 Available slots for",
      bookingData.selectedDate,
      ":",
      availableSlots
    );

    if (availableSlots.length === 0) {
      return (
        <div className={styles.timePlaceholder}>
          <FiInfo className={styles.infoIcon} />
          <p>هیچ ساعت خالی برای این تاریخ وجود ندارد.</p>
        </div>
      );
    }

    return (
      <div className={styles.timeGrid}>
        {allSlots.map((time) => {
          // بررسی دقیق‌تر برای today
          let isAvailable = availableSlots.includes(time);

          // اگر تاریخ امروز است، دوباره بررسی کن
          const today = new Date().toISOString().split("T")[0];
          if (bookingData.selectedDate === today) {
            isAvailable = isAvailable && isTimeValidForToday(time, today);
          }

          const isSelected = bookingData.selectedTime === time;

          return (
            <button
              key={time}
              className={`${styles.timeSlot} ${
                isSelected ? styles.selected : ""
              } ${!isAvailable ? styles.unavailable : ""}`}
              onClick={() => {
                if (isAvailable) {
                  handleBookingChange("selectedTime", time);
                }
              }}
              disabled={!isAvailable}
            >
              {time}
              {!isAvailable && <span className={styles.bookedBadge}>پر</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.bookingPage}>
      {error && (
        <div className={styles.errorBanner}>
          <FiInfo />
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <FiCalendar className={styles.titleIcon} />
          {isEditing ? "تغییر زمان نوبت" : "رزرو وقت ماساژ"}
        </h1>

        <div className={styles.bookingSteps}>
          <div
            className={`${styles.step} ${
              bookingStep >= 1 ? styles.active : ""
            }`}
          >
            <div className={styles.stepNumber}>۱</div>
            <div className={styles.stepLabel}>انتخاب ماساژ</div>
          </div>

          <div
            className={`${styles.step} ${
              bookingStep >= 2 ? styles.active : ""
            }`}
          >
            <div className={styles.stepNumber}>۲</div>
            <div className={styles.stepLabel}>تاریخ و ساعت</div>
          </div>

          <div
            className={`${styles.step} ${
              bookingStep >= 3 ? styles.active : ""
            }`}
          >
            <div className={styles.stepNumber}>۳</div>
            <div className={styles.stepLabel}>تأیید نهایی</div>
          </div>
        </div>
      </div>

      <div className={styles.bookingContent}>
        {/* Step 1: Select Massage */}
        {bookingStep === 1 && !isEditing && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>نوع ماساژ را انتخاب کنید.</h2>
            <div className={styles.massageGrid}>
              {massageTypes.map((massage) => (
                <div
                  key={massage.id}
                  className={`${styles.massageCard} ${
                    bookingData.selectedMassage?.id === massage.id
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() =>
                    handleBookingChange("selectedMassage", massage)
                  }
                >
                  <h3 className={styles.massageName}>{massage.name}</h3>
                  <p className={styles.massageDescription}>
                    {massage.description}
                  </p>
                  <div className={styles.massageDetails}>
                    <span>{massage.duration}</span>
                    <span>
                      {typeof massage.price === "number"
                        ? new Intl.NumberFormat("fa-IR").format(massage.price) +
                          " تومان"
                        : massage.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleNextStep}
              disabled={!bookingData.selectedMassage}
              className={styles.nextButton}
            >
              ادامه
            </button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {bookingStep === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>تاریخ و ساعت را انتخاب کنید.</h2>

            <div className={styles.dateSection}>
              <div className={styles.dateHeader}>
                <h3>انتخاب تاریخ</h3>
                <div className={styles.weekNavigation}>
                  <button
                    className={styles.weekNavButton}
                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                    disabled={currentWeekOffset === 0}
                  >
                    <FiChevronRight />
                    هفته قبل
                  </button>
                  <button
                    className={styles.weekNavButton}
                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                  >
                    هفته بعد
                    <FiChevronLeft />
                  </button>
                </div>
              </div>
              <div className={styles.dateGrid}>
                {displayDates.map((dateObj) => (
                  <div
                    key={dateObj.date}
                    className={`${styles.dateCard} ${
                      bookingData.selectedDate === dateObj.date
                        ? styles.selected
                        : ""
                    } ${!dateObj.isAvailable ? styles.unavailable : ""}`}
                    onClick={() => {
                      if (dateObj.isAvailable) {
                        handleBookingChange("selectedDate", dateObj.date);
                        handleBookingChange("selectedTime", "");
                      }
                    }}
                  >
                    <div className={styles.dayName}>
                      {dateObj.dayName}
                      {dateObj.isToday && (
                        <>
                          <span className={styles.separator}>-</span>
                          <span className={styles.todayBadge}>امروز</span>
                        </>
                      )}
                    </div>

                    <div className={styles.dateDisplay}>{dateObj.display}</div>
                    {!dateObj.isAvailable && (
                      <div className={styles.unavailableBadge}>تکمیل</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.timeSection}>
              <h3>انتخاب ساعت</h3>
              {renderTimeSlots()}
            </div>

            <div className={styles.notesSection}>
              <h3>یادداشت‌های اضافی</h3>
              <textarea
                value={bookingData.notes}
                onChange={(e) => handleBookingChange("notes", e.target.value)}
                placeholder="هرگونه نکته خاص یا درخواست ویژه (اختیاری)..."
                className={styles.notesTextarea}
                rows="3"
              />
            </div>

            <div className={styles.stepActions}>
              <button onClick={handlePrevStep} className={styles.prevButton}>
                مرحله قبل
              </button>
              <button
                onClick={handleNextStep}
                disabled={
                  !bookingData.selectedDate || !bookingData.selectedTime
                }
                className={styles.nextButton}
              >
                ادامه
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {bookingStep === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>تأیید نهایی</h2>

            <div className={styles.confirmationCard}>
              {!isEditing && (
                <div className={styles.detailRow}>
                  <span>نوع ماساژ:</span>
                  <span>{bookingData.selectedMassage?.name}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span>تاریخ:</span>
                <span>
                  {new Date(bookingData.selectedDate).toLocaleDateString(
                    "fa-IR"
                  )}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span>ساعت:</span>
                <span>{bookingData.selectedTime}</span>
              </div>
              {bookingData.notes && (
                <div className={styles.detailRow}>
                  <span>یادداشت:</span>
                  <span>{bookingData.notes}</span>
                </div>
              )}
            </div>

            <div className={styles.stepActions}>
              <button onClick={handlePrevStep} className={styles.prevButton}>
                مرحله قبل
              </button>
              <button
                onClick={handleSubmit}
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  "در حال انجام..."
                ) : (
                  <>
                    <FiCheck />
                    {isEditing ? "تأیید تغییر زمان" : "تأیید و رزرو نهایی"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Summary Sidebar */}
        <div className={styles.bookingSummary}>
          <h3>خلاصه رزرو</h3>

          {bookingData.selectedMassage && (
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>ماساژ انتخاب شده:</div>
              <div className={styles.summaryValue}>
                {bookingData.selectedMassage.name}
              </div>
              <div className={styles.summarySubtext}>
                {bookingData.selectedMassage.duration} •{" "}
                {typeof bookingData.selectedMassage.price === "number"
                  ? new Intl.NumberFormat("fa-IR").format(
                      bookingData.selectedMassage.price
                    ) + " تومان"
                  : bookingData.selectedMassage.price}
              </div>
            </div>
          )}

          {bookingData.selectedDate && (
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>تاریخ:</div>
              <div className={styles.summaryValue}>
                {new Date(bookingData.selectedDate).toLocaleDateString("fa-IR")}
              </div>
            </div>
          )}

          {bookingData.selectedTime && (
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>ساعت:</div>
              <div className={styles.summaryValue}>
                {bookingData.selectedTime}
              </div>
            </div>
          )}

          <div className={styles.summaryTotal}>
            <div className={styles.totalLabel}>مجموع:</div>
            <div className={styles.totalValue}>
              {bookingData.selectedMassage?.price
                ? new Intl.NumberFormat("fa-IR").format(
                    bookingData.selectedMassage.price
                  ) + " تومان"
                : "۰ تومان"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
