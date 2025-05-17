import { useTranslation } from "../lib/i18n";

const Help = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 px-4 md:px-0 max-w-3xl mx-auto pb-20 pt-8">
      <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-8 text-accent">{t("help.title")}</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">{t("help.faqTitle")}</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-[hsl(var(--space-nebula)_/_0.3)] rounded-lg shadow-sm">
                <h4 className="font-medium mb-2 text-accent">{t("help.faq1.question")}</h4>
                <p className="text-foreground text-sm">
                  {t("help.faq1.answer")}
                </p>
              </div>
              
              <div className="p-4 bg-[hsl(var(--space-nebula)_/_0.3)] rounded-lg shadow-sm">
                <h4 className="font-medium mb-2 text-accent">{t("help.faq2.question")}</h4>
                <p className="text-foreground text-sm">
                  {t("help.faq2.answer")}
                </p>
              </div>
              
              <div className="p-4 bg-[hsl(var(--space-nebula)_/_0.3)] rounded-lg shadow-sm">
                <h4 className="font-medium mb-2 text-accent">{t("help.faq3.question")}</h4>
                <p className="text-foreground text-sm">
                  {t("help.faq3.answer")}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">{t("help.supportTitle")}</h3>
            <p className="text-foreground mb-2">
              {t("help.supportText")}
            </p>
            <p className="text-accent">support@ihero3d.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
