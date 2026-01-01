
import React, { useState } from 'react';
import { auth, db } from '../services/firebase.ts';

interface AuthViewProps {
  onSuccess: () => void;
  onBack: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+93', name: 'Afghanistan' },
  { code: '+355', name: 'Albania' },
  { code: '+213', name: 'Algeria' },
  { code: '+1-684', name: 'American Samoa' },
  { code: '+376', name: 'Andorra' },
  { code: '+244', name: 'Angola' },
  { code: '+1-264', name: 'Anguilla' },
  { code: '+672', name: 'Antarctica' },
  { code: '+1-268', name: 'Antigua and Barbuda' },
  { code: '+54', name: 'Argentina' },
  { code: '+374', name: 'Armenia' },
  { code: '+297', name: 'Aruba' },
  { code: '+61', name: 'Australia' },
  { code: '+43', name: 'Austria' },
  { code: '+994', name: 'Azerbaijan' },
  { code: '+1-242', name: 'Bahamas' },
  { code: '+973', name: 'Bahrain' },
  { code: '+880', name: 'Bangladesh' },
  { code: '+1-246', name: 'Barbados' },
  { code: '+375', name: 'Belarus' },
  { code: '+32', name: 'Belgium' },
  { code: '+501', name: 'Belize' },
  { code: '+229', name: 'Benin' },
  { code: '+1-441', name: 'Bermuda' },
  { code: '+975', name: 'Bhutan' },
  { code: '+591', name: 'Bolivia' },
  { code: '+387', name: 'Bosnia and Herzegovina' },
  { code: '+267', name: 'Botswana' },
  { code: '+55', name: 'Brazil' },
  { code: '+246', name: 'British Indian Ocean Territory' },
  { code: '+1-284', name: 'British Virgin Islands' },
  { code: '+673', name: 'Brunei' },
  { code: '+359', name: 'Bulgaria' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+257', name: 'Burundi' },
  { code: '+855', name: 'Cambodia' },
  { code: '+237', name: 'Cameroon' },
  { code: '+1', name: 'Canada' },
  { code: '+238', name: 'Cape Verde' },
  { code: '+1-345', name: 'Cayman Islands' },
  { code: '+236', name: 'Central African Republic' },
  { code: '+235', name: 'Chad' },
  { code: '+56', name: 'Chile' },
  { code: '+86', name: 'China' },
  { code: '+61', name: 'Christmas Island' },
  { code: '+61', name: 'Cocos Islands' },
  { code: '+57', name: 'Colombia' },
  { code: '+269', name: 'Comoros' },
  { code: '+682', name: 'Cook Islands' },
  { code: '+506', name: 'Costa Rica' },
  { code: '+385', name: 'Croatia' },
  { code: '+53', name: 'Cuba' },
  { code: '+599', name: 'Curacao' },
  { code: '+357', name: 'Cyprus' },
  { code: '+420', name: 'Czech Republic' },
  { code: '+243', name: 'Democratic Republic of the Congo' },
  { code: '+45', name: 'Denmark' },
  { code: '+253', name: 'Djibouti' },
  { code: '+1-767', name: 'Dominica' },
  { code: '+1-809', name: 'Dominican Republic' },
  { code: '+670', name: 'East Timor' },
  { code: '+593', name: 'Ecuador' },
  { code: '+20', name: 'Egypt' },
  { code: '+503', name: 'El Salvador' },
  { code: '+240', name: 'Equatorial Guinea' },
  { code: '+291', name: 'Eritrea' },
  { code: '+372', name: 'Estonia' },
  { code: '+251', name: 'Ethiopia' },
  { code: '+500', name: 'Falkland Islands' },
  { code: '+298', name: 'Faroe Islands' },
  { code: '+679', name: 'Fiji' },
  { code: '+358', name: 'Finland' },
  { code: '+33', name: 'France' },
  { code: '+689', name: 'French Polynesia' },
  { code: '+241', name: 'Gabon' },
  { code: '+220', name: 'Gambia' },
  { code: '+995', name: 'Georgia' },
  { code: '+49', name: 'Germany' },
  { code: '+233', name: 'Ghana' },
  { code: '+350', name: 'Gibraltar' },
  { code: '+30', name: 'Greece' },
  { code: '+299', name: 'Greenland' },
  { code: '+1-473', name: 'Grenada' },
  { code: '+1-671', name: 'Guam' },
  { code: '+502', name: 'Guatemala' },
  { code: '+44-1481', name: 'Guernsey' },
  { code: '+224', name: 'Guinea' },
  { code: '+245', name: 'Guinea-Bissau' },
  { code: '+592', name: 'Guyana' },
  { code: '+509', name: 'Haiti' },
  { code: '+504', name: 'Honduras' },
  { code: '+852', name: 'Hong Kong' },
  { code: '+36', name: 'Hungary' },
  { code: '+354', name: 'Iceland' },
  { code: '+62', name: 'Indonesia' },
  { code: '+98', name: 'Iran' },
  { code: '+964', name: 'Iraq' },
  { code: '+353', name: 'Ireland' },
  { code: '+44-1624', name: 'Isle of Man' },
  { code: '+972', name: 'Israel' },
  { code: '+39', name: 'Italy' },
  { code: '+225', name: 'Ivory Coast' },
  { code: '+1-876', name: 'Jamaica' },
  { code: '+81', name: 'Japan' },
  { code: '+44-1534', name: 'Jersey' },
  { code: '+962', name: 'Jordan' },
  { code: '+7', name: 'Kazakhstan' },
  { code: '+254', name: 'Kenya' },
  { code: '+686', name: 'Kiribati' },
  { code: '+383', name: 'Kosovo' },
  { code: '+965', name: 'Kuwait' },
  { code: '+996', name: 'Kyrgyzstan' },
  { code: '+856', name: 'Laos' },
  { code: '+371', name: 'Latvia' },
  { code: '+961', name: 'Lebanon' },
  { code: '+266', name: 'Lesotho' },
  { code: '+231', name: 'Liberia' },
  { code: '+218', name: 'Libya' },
  { code: '+423', name: 'Liechtenstein' },
  { code: '+370', name: 'Lithuania' },
  { code: '+352', name: 'Luxembourg' },
  { code: '+853', name: 'Macau' },
  { code: '+389', name: 'Macedonia' },
  { code: '+261', name: 'Madagascar' },
  { code: '+265', name: 'Malawi' },
  { code: '+60', name: 'Malaysia' },
  { code: '+960', name: 'Maldives' },
  { code: '+223', name: 'Mali' },
  { code: '+356', name: 'Malta' },
  { code: '+692', name: 'Marshall Islands' },
  { code: '+222', name: 'Mauritania' },
  { code: '+230', name: 'Mauritius' },
  { code: '+262', name: 'Mayotte' },
  { code: '+52', name: 'Mexico' },
  { code: '+691', name: 'Micronesia' },
  { code: '+373', name: 'Moldova' },
  { code: '+377', name: 'Monaco' },
  { code: '+976', name: 'Mongolia' },
  { code: '+382', name: 'Montenegro' },
  { code: '+1-664', name: 'Montserrat' },
  { code: '+212', name: 'Morocco' },
  { code: '+258', name: 'Mozambique' },
  { code: '+95', name: 'Myanmar' },
  { code: '+264', name: 'Namibia' },
  { code: '+674', name: 'Nauru' },
  { code: '+977', name: 'Nepal' },
  { code: '+31', name: 'Netherlands' },
  { code: '+687', name: 'New Caledonia' },
  { code: '+64', name: 'New Zealand' },
  { code: '+505', name: 'Nicaragua' },
  { code: '+227', name: 'Niger' },
  { code: '+234', name: 'Nigeria' },
  { code: '+683', name: 'Niue' },
  { code: '+850', name: 'North Korea' },
  { code: '+1-670', name: 'Northern Mariana Islands' },
  { code: '+47', name: 'Norway' },
  { code: '+968', name: 'Oman' },
  { code: '+92', name: 'Pakistan' },
  { code: '+680', name: 'Palau' },
  { code: '+970', name: 'Palestine' },
  { code: '+507', name: 'Panama' },
  { code: '+675', name: 'Papua New Guinea' },
  { code: '+595', name: 'Paraguay' },
  { code: '+51', name: 'Peru' },
  { code: '+63', name: 'Philippines' },
  { code: '+64', name: 'Pitcairn' },
  { code: '+48', name: 'Poland' },
  { code: '+351', name: 'Portugal' },
  { code: '+1-787', name: 'Puerto Rico' },
  { code: '+974', name: 'Qatar' },
  { code: '+242', name: 'Republic of the Congo' },
  { code: '+262', name: 'Reunion' },
  { code: '+40', name: 'Romania' },
  { code: '+7', name: 'Russia' },
  { code: '+250', name: 'Rwanda' },
  { code: '+590', name: 'Saint Barthelemy' },
  { code: '+290', name: 'Saint Helena' },
  { code: '+1-869', name: 'Saint Kitts and Nevis' },
  { code: '+1-758', name: 'Saint Lucia' },
  { code: '+590', name: 'Saint Martin' },
  { code: '+508', name: 'Saint Pierre and Miquelon' },
  { code: '+1-784', name: 'Saint Vincent and the Grenadines' },
  { code: '+685', name: 'Samoa' },
  { code: '+378', name: 'San Marino' },
  { code: '+239', name: 'Sao Tome and Principe' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+221', name: 'Senegal' },
  { code: '+381', name: 'Serbia' },
  { code: '+248', name: 'Seychelles' },
  { code: '+232', name: 'Sierra Leone' },
  { code: '+65', name: 'Singapore' },
  { code: '+1-721', name: 'Sint Maarten' },
  { code: '+421', name: 'Slovakia' },
  { code: '+386', name: 'Slovenia' },
  { code: '+677', name: 'Solomon Islands' },
  { code: '+252', name: 'Somalia' },
  { code: '+27', name: 'South Africa' },
  { code: '+82', name: 'South Korea' },
  { code: '+211', name: 'South Sudan' },
  { code: '+34', name: 'Spain' },
  { code: '+94', name: 'Sri Lanka' },
  { code: '+249', name: 'Sudan' },
  { code: '+597', name: 'Suriname' },
  { code: '+47', name: 'Svalbard and Jan Mayen' },
  { code: '+268', name: 'Swaziland' },
  { code: '+46', name: 'Sweden' },
  { code: '+41', name: 'Switzerland' },
  { code: '+963', name: 'Syria' },
  { code: '+886', name: 'Taiwan' },
  { code: '+992', name: 'Tajikistan' },
  { code: '+255', name: 'Tanzania' },
  { code: '+66', name: 'Thailand' },
  { code: '+228', name: 'Togo' },
  { code: '+690', name: 'Tokelau' },
  { code: '+676', name: 'Tonga' },
  { code: '+1-868', name: 'Trinidad and Tobago' },
  { code: '+216', name: 'Tunisia' },
  { code: '+90', name: 'Turkey' },
  { code: '+993', name: 'Turkmenistan' },
  { code: '+1-649', name: 'Turks and Caicos Islands' },
  { code: '+688', name: 'Tuvalu' },
  { code: '+1-340', name: 'U.S. Virgin Islands' },
  { code: '+256', name: 'Uganda' },
  { code: '+380', name: 'Ukraine' },
  { code: '+971', name: 'United Arab Emirates' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+1', name: 'United States' },
  { code: '+598', name: 'Uruguay' },
  { code: '+998', name: 'Uzbekistan' },
  { code: '+678', name: 'Vanuatu' },
  { code: '+379', name: 'Vatican' },
  { code: '+58', name: 'Venezuela' },
  { code: '+84', name: 'Vietnam' },
  { code: '+681', name: 'Wallis and Futuna' },
  { code: '+212', name: 'Western Sahara' },
  { code: '+967', name: 'Yemen' },
  { code: '+260', name: 'Zambia' },
  { code: '+263', name: 'Zimbabwe' },
];

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin) {
      if (!validatePassword(password)) {
        setError('Security Protocol: Password requires 8+ chars, Uppercase, Lowercase, Number, and Special Char.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Verification Error: Passwords do not match.');
        setLoading(false);
        return;
      }
      if (!firstName.trim() || !lastName.trim() || !contact.trim()) {
        setError('Identification Error: All fields required.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (user) {
          const fullName = `${firstName.trim()} ${lastName.trim()}`;
          await user.updateProfile({ displayName: fullName });
          const fullContact = `${countryCode} ${contact.trim()}`;
          
          await db.collection('users').doc(user.uid).set({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            fullName,
            contact: fullContact,
            email,
            isPaid: false,
            createdAt: new Date().toISOString(),
            habits: [],
            monthlyGoals: [],
            annualCategories: [],
            config: {
              year: '2026',
              showVisionBoard: true,
              activeMonths: ['January'],
            },
            weeklyGoals: []
          });
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Access Denied: Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-500">
      {!isLogin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                placeholder="First Identity"
                required={!isLogin}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                placeholder="Last Identity"
                required={!isLogin}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact String</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[160px] bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-4 py-4 outline-none focus:border-[#76C7C0] focus:bg-white font-black text-gray-400 text-xs appearance-none cursor-pointer"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={`${item.name}-${item.code}`} value={item.code}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="flex-1 min-w-0 bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
                placeholder="Mobile"
                required={!isLogin}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
          placeholder="architect@domain.io"
          required
        />
      </div>

      <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2' : ''} gap-4`}>
        <div className="space-y-1.5 relative">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secure Key</label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
            placeholder="••••••••"
            required
          />
        </div>
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Key</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#76C7C0] focus:bg-white transition-all font-bold text-gray-800 placeholder:text-gray-300"
              placeholder="••••••••"
              required={!isLogin}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-4 mt-4"
      >
        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? 'PROCESSING...' : isLogin ? 'INITIATE SESSION' : 'DEPLOY PROTOCOL'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E8F5F4] rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -z-10" />

      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full text-[#76C7C0]" fill="currentColor" viewBox="0 0 100 100">
            <pattern id="auth-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#auth-grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-24 h-24 bg-[#76C7C0] rounded-[2rem] flex items-center justify-center text-white font-black text-5xl mx-auto mb-10 shadow-2xl shadow-[#76C7C0]/30 animate-float">N</div>
          <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-6">NextYou21</h2>
          <div className="w-20 h-1.5 bg-[#76C7C0] mx-auto mb-10 rounded-full" />
          <p className="text-2xl text-gray-400 font-medium leading-relaxed italic">
            "The architecture of your life is defined by the high-resolution habits you execute today."
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all group z-20"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
          Terminal Exit
        </button>

        <div className="w-full max-w-xl bg-white border border-gray-100 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-8 md:p-14 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[3.5rem] -z-10" />
          
          <header className="mb-10 text-center">
            <div className="lg:hidden w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl shadow-gray-200">N</div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic mb-3">
              {isLogin ? 'Welcome Back.' : 'New Architect.'}
            </h1>
            <p className="text-gray-400 font-medium tracking-tight">
              {isLogin ? 'Initialize session to resume cycles.' : 'Deploy your first performance protocol.'}
            </p>
          </header>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl mb-8 flex items-start gap-4 animate-shake">
              <span className="text-xl">⚠️</span>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-2xl mb-8 flex items-start gap-4 animate-in fade-in duration-300">
              <span className="text-xl">✅</span>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-relaxed">{success}</p>
            </div>
          )}

          {renderAuthForm()}

          <footer className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-[#76C7C0] transition-colors"
            >
              {isLogin ? "NEW ARCHITECT? INITIALIZE PROFILE" : "ALREADY REGISTERED? AUTHENTICATE"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
