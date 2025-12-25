import { BookOpen, FileText, Link as LinkIcon, Facebook, Youtube, MessageCircle, Send, Moon, Sun, Share2, Download, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { toast } from '@/hooks/use-toast';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, installApp } = usePwaInstall();

  const socialLinks = [
    { href: 'https://facebook.com/hsciantv', icon: Facebook, label: 'Facebook Page', color: 'text-blue-600' },
    { href: 'https://facebook.com/groups/hsciantv', icon: Facebook, label: 'Facebook Group', color: 'text-blue-500' },
    { href: 'https://youtube.com/@hsciantv', icon: Youtube, label: 'YouTube', color: 'text-red-500' },
    { href: 'https://wa.me/+8801234567890', icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500' },
    { href: 'https://t.me/hsciantv', icon: Send, label: 'Telegram', color: 'text-blue-400' },
  ];

  const handleShareApp = async () => {
    const url = window.location.origin;
    const shareData = {
      title: 'HSCianTV',
      text: 'HSCianTV - HSC শিক্ষার্থীদের জন্য বিনামূল্যে ভিডিও লেকচার!',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onClose();
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "লিংক কপি হয়েছে!",
        description: "অ্যাপের লিংক ক্লিপবোর্ডে কপি করা হয়েছে।",
      });
      onClose();
    }
  };

  const handleInstallApp = async () => {
    await installApp();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}
              </span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              to="/"
              onClick={onClose}
              className="sidebar-link"
            >
              <BookOpen size={20} />
              <span>All Courses</span>
            </Link>

            <a
              href="#"
              className="sidebar-link"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              <FileText size={20} />
              <span>Study Materials</span>
            </a>

            <a
              href="#"
              className="sidebar-link bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              <LinkIcon size={20} />
              <span className="font-medium">PDF Downloads</span>
            </a>
          </div>

          <div className="border-t border-border" />

          {/* App Actions */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">অ্যাপ</p>
            
            <button
              onClick={handleShareApp}
              className="sidebar-link w-full"
            >
              <Share2 size={20} className="text-green-500" />
              <span>অ্যাপ শেয়ার করুন</span>
            </button>

            <button
              onClick={handleInstallApp}
              disabled={isInstalled}
              className={`sidebar-link w-full ${isInstalled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isInstalled ? (
                <>
                  <Check size={20} className="text-green-500" />
                  <span>ইনস্টল করা হয়েছে</span>
                </>
              ) : (
                <>
                  <Download size={20} className="text-primary" />
                  <span>অ্যাপ ইনস্টল করুন</span>
                </>
              )}
            </button>
          </div>

          <div className="border-t border-border" />

          {/* Social Links */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">যোগাযোগ</p>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-link"
                onClick={onClose}
              >
                <link.icon size={20} className={link.color} />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
