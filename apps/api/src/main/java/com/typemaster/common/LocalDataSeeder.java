package com.typemaster.common;

import com.typemaster.achievement.Achievement;
import com.typemaster.achievement.AchievementRepository;
import com.typemaster.content.Passage;
import com.typemaster.content.PassageRepository;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalDataSeeder implements CommandLineRunner {

    private final PassageRepository passageRepository;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDataSeeder(
            PassageRepository passageRepository,
            AchievementRepository achievementRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.passageRepository = passageRepository;
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User("admin@typemaster.kh", passwordEncoder.encode("Admin1234!"), "AdminTypist", "en");
            admin.setRole("ADMIN");
            userRepository.save(admin);

            User user = new User("protypist@typemaster.kh", passwordEncoder.encode("Password123!"), "ProTypistKh", "en");
            user.setRole("MEMBER");
            userRepository.save(user);
        }

        if (passageRepository.count() == 0) {
            passageRepository.save(new Passage("en", "Quick Fox Practice", "The quick brown fox jumps over the lazy dog. Practice typing every day to build confidence, speed, and accuracy.", "BEGINNER", "GENERAL", "SENTENCES", "Pangram Collection", "Public Domain", "PUBLISHED"));
            passageRepository.save(new Passage("en", "Finger Placement Basics", "Typing with all ten fingers helps you work faster and reduces strain on your hands and wrists over time.", "BEGINNER", "TUTORIAL", "PARAGRAPH", "TypeMaster Team", "CC-BY-4.0", "PUBLISHED"));
            passageRepository.save(new Passage("en", "Craft of Programming", "Programming is the art of expressing thought clearly. When you write clean and simple code, it becomes its own best explanation for those who come after you.", "INTERMEDIATE", "TECHNOLOGY", "PARAGRAPH", "Software Insights", "Public Domain", "PUBLISHED"));
            passageRepository.save(new Passage("en", "Deliberate Practice", "Consistent daily practice is far more effective than occasional marathon sessions. Focus on accuracy first, and natural speed will develop on its own.", "INTERMEDIATE", "GENERAL", "PARAGRAPH", "Learning Science", "CC-BY-4.0", "PUBLISHED"));
            passageRepository.save(new Passage("en", "The Architecture of Focus", "The greatest virtue of the digital craftsman is the patience to refine every detail until simplicity and purpose meet in quiet harmony. In typing, as in writing, mastery emerges from deliberate concentration and steady rhythm.", "ADVANCED", "LITERATURE", "QUOTE", "Digital Philosophy", "CC-BY-4.0", "PUBLISHED"));

            passageRepository.save(new Passage("km", "ការរៀនវាយអក្សរ", "ការរៀនវាយអត្ថបទជួយឱ្យយើងធ្វើការងារបានលឿននិងមានប្រសិទ្ធភាពខ្ពស់។", "BEGINNER", "TUTORIAL", "SENTENCES", "TypeMaster Team", "CC-BY-4.0", "PUBLISHED"));
            passageRepository.save(new Passage("km", "សម្បត្តិវប្បធម៌ខ្មែរ", "ប្រទេសកម្ពុជាមានសម្បត្តិវប្បធម៌សម្បូរបែប និងប្រាសាទបុរាណជាច្រើនដែលល្បីល្បាញលើពិភពលោក។", "BEGINNER", "CULTURE", "PARAGRAPH", "General Knowledge", "Public Domain", "PUBLISHED"));
            passageRepository.save(new Passage("km", "បច្ចេកវិទ្យានិងការអភិវឌ្ឍ", "បច្ចេកវិទ្យាព័ត៌មានវិទ្យាកំពុងដើរតួនាទីយ៉ាងសំខាន់ក្នុងការអភិវឌ្ឍសង្គមជាតិ។ ការប្រើប្រាស់កុំព្យូទ័រនិងជំនាញវាយអក្សរខ្មែរបានត្រឹមត្រូវ ជាមូលដ្ឋានគ្រឹះសម្រាប់សិស្ស និស្សិត និងបុគ្គលិកគ្រប់រូប។", "INTERMEDIATE", "TECHNOLOGY", "PARAGRAPH", "Tech in Cambodia", "CC-BY-4.0", "PUBLISHED"));
            passageRepository.save(new Passage("km", "តម្លៃនៃការអានសៀវភៅ", "សៀវភៅគឺជាស្ពានចម្លងចំណេះដឹងពីជំនាន់មួយទៅជំនាន់មួយទៀត។ ការអានជាប្រចាំជួយពង្រីកការគិត និងការយល់ដឹងឱ្យកាន់តែទូលំទូលាយ។", "INTERMEDIATE", "EDUCATION", "PARAGRAPH", "Khmer Readers", "CC-BY-4.0", "PUBLISHED"));
            passageRepository.save(new Passage("km", "អច្ឆរិយវត្ថុនៃប្រាសាទអង្គរវត្ត", "ប្រាសាទអង្គរវត្តជាស្នាដៃឯកនៃស្ថាបត្យកម្មខ្មែរសម័យបុរាណ ដែលបង្ហាញពីភាពរុងរឿងនិងទេពកោសល្យដ៏មហិមារបស់បុព្វបុរសខ្មែរ។ សំណង់ថ្មភក់ដ៏ធំស្កឹមស្កៃនេះត្រូវបានកសាងឡើងដើម្បីឧទ្ទិសដល់ព្រះវិស្ណុ និងជាបេតិកភណ្ឌពិភពលោកដែលមនុស្សទូទាំងពិភពលោកកោតសរសើរ។", "ADVANCED", "HISTORY", "PARAGRAPH", "Khmer History", "Public Domain", "PUBLISHED"));
        }

        if (achievementRepository.count() == 0) {
            achievementRepository.save(new Achievement("FIRST_TEST", "First Step", "ជំហានដំបូង", "Complete your first typing test.", "បញ្ចប់ការធ្វើតេស្តវាយអត្ថបទលើកដំបូងរបស់អ្នក។", "TARGET", "{\"type\":\"TEST_COUNT\",\"threshold\":1}", true));
            achievementRepository.save(new Achievement("SPEED_50_WPM", "Speedster 50", "ល្បឿន 50 WPM", "Achieve 50 WPM on an English test.", "សម្រេចបាន 50 WPM លើការធ្វើតេស្តភាសាអង់គ្លេស។", "TARGET", "{\"type\":\"MIN_WPM\",\"threshold\":50}", true));
            achievementRepository.save(new Achievement("SPEED_100_WPM", "Centurion 100", "ល្បឿន 100 WPM", "Achieve 100 WPM on an English test.", "សម្រេចបាន 100 WPM លើការធ្វើតេស្តភាសាអង់គ្លេស។", "TARGET", "{\"type\":\"MIN_WPM\",\"threshold\":100}", true));
            achievementRepository.save(new Achievement("KHMER_TYPIST", "Khmer Typist", "អ្នកវាយអក្សរខ្មែរ", "Complete a Khmer typing test with >= 90% accuracy.", "បញ្ចប់ការធ្វើតេស្តវាយអក្សរខ្មែរដោយមានភាពត្រឹមត្រូវយ៉ាងតិច 90%។", "TARGET", "{\"type\":\"KHMER_ACCURACY\",\"threshold\":90}", true));
            achievementRepository.save(new Achievement("KHMER_MASTER", "Khmer Master", "ជើងឯកអក្សរខ្មែរ", "Achieve 200 CPM on a Khmer typing test.", "សម្រេចបាន 200 CPM លើការធ្វើតេស្តភាសាខ្មែរ។", "TARGET", "{\"type\":\"MIN_CPM_KM\",\"threshold\":200}", true));
            achievementRepository.save(new Achievement("ACCURACY_98", "Precision Typist", "ភាពសុក្រឹតខ្ពស់", "Complete any test with >= 98% accuracy.", "បញ្ចប់ការធ្វើតេស្តណាមួយដោយមានភាពត្រឹមត្រូវយ៉ាងតិច 98%។", "TARGET", "{\"type\":\"MIN_ACCURACY\",\"threshold\":98}", true));
            achievementRepository.save(new Achievement("PRACTICE_10", "Dedicated Student", "ការអនុវត្តខ្ជាប់ខ្ជួន", "Complete 10 typing practice sessions.", "បញ្ចប់វគ្គហ្វឹកហាត់វាយអត្ថបទចំនួន 10 លើក។", "TIERED", "{\"type\":\"TEST_COUNT\",\"threshold\":10}", true));
        }
    }
}
