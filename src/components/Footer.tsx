
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Twitch, Gamepad2, Mail, Phone, MapPin, FileText } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#0B1120] text-gray-300 py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <button className="bg-[#00B4D8] text-white font-bold py-2 px-6 rounded-md uppercase tracking-wider text-sm hover:bg-[#0096B4] transition-colors flex items-center gap-2">
                                <span className="text-xl">❖</span> VIET TECH INNOVATION
                            </button>
                        </div>
                        <p className="max-w-md text-slate-400 text-sm leading-relaxed">
                            Pioneering the future of gaming with innovative experiences and cutting-edge technology.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={18} />} href="#" />
                            <SocialIcon icon={<Facebook size={18} />} href="#" />
                            <SocialIcon icon={<Instagram size={18} />} href="#" />
                            <SocialIcon icon={<Gamepad2 size={18} />} href="#" />
                            <SocialIcon icon={<Youtube size={18} />} href="#" />
                            <SocialIcon icon={<Twitch size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="md:text-right space-y-4 flex flex-col items-start md:items-end">
                        <h3 className="text-white font-bold tracking-wider text-sm uppercase mb-2">Contact Info</h3>

                        <a href="mailto:info@vietinv.tech" className="flex items-center gap-3 text-sm hover:text-white transition-colors group">
                            <span className="order-2 md:order-1">info@vietinv.tech</span>
                            <Mail size={16} className="text-[#00B4D8] order-1 md:order-2" />
                        </a>

                        <a href="tel:+84964230888" className="flex items-center gap-3 text-sm hover:text-white transition-colors group">
                            <span className="order-2 md:order-1">+84 964.230.888</span>
                            <Phone size={16} className="text-[#00B4D8] order-1 md:order-2" />
                        </a>

                        <div className="flex items-start gap-3 text-sm text-right justify-end">
                            <span className="order-2 md:order-1 max-w-[250px]">CÔNG TY TNHH VIET TECH INNOVATION</span>
                            <MapPin size={16} className="text-[#00B4D8] order-1 md:order-2 mt-1 min-w-[16px]" />
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <span className="order-2 md:order-1">Tax: 0111121088</span>
                            <FileText size={16} className="text-[#00B4D8] order-1 md:order-2" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2025 Viettech Innovation. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#00B4D8] hover:text-white transition-all duration-300"
        >
            {icon}
        </a>
    )
}
