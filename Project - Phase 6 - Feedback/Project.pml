<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="feedback_survey" src="feedback_survey/feedback_survey.dlg" />
    </Dialogs>
    <Resources>
        <File name="feedback_survey" src="html/css/feedback_survey.css" />
        <File name="feedback_survey" src="html/js/feedback_survey.js" />
        <File name="feedback_survey" src="html/pages/feedback_survey.html" />
        <File name="Congratulations" src="sounds/Congratulations.ogg" />
        <File name="applause2" src="sounds/applause2.ogg" />
        <File name="bonuspts" src="sounds/bonuspts.ogg" />
        <File name="gamepositive" src="sounds/gamepositive.ogg" />
        <File name="glitch" src="sounds/glitch.ogg" />
        <File name="intro" src="sounds/intro.ogg" />
        <File name="itempop" src="sounds/itempop.ogg" />
    </Resources>
    <Topics>
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="feedback_survey_enu" src="feedback_survey/feedback_survey_enu.top" topicName="feedback_survey" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
