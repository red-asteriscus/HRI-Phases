<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="Diploma_Segment" src="Diploma_Segment/Diploma_Segment.dlg" />
    </Dialogs>
    <Resources>
        <File name="suit picture" src="html/pics/suit_picture.png" />
        <File name="Graduation_Welcome" src="html/pics/Graduation_Welcome.jpg" />
        <File name="class_of_2026_pic" src="html/pics/class_of_2026_pic.png" />
        <File name="congrats_photo" src="html/pics/congrats_photo.jpg" />
        <File name="diploma_picture" src="html/pics/diploma_picture.png" />
        <File name="seating_map" src="html/pics/seating_map.png" />
        <File name="seats" src="html/pics/seats.png" />
        <File name="index" src="html/index.html" />
        <File name="wlc" src="html/pics/wlc.jpg" />
        <File name="script" src="html/script.js" />
        <File name="style" src="html/style.css" />
    </Resources>
    <Topics>
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="Diploma_Segment_enu" src="Diploma_Segment/Diploma_Segment_enu.top" topicName="Diploma_Segment" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
