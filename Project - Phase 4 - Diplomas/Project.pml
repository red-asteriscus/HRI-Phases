<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="Diploma_Segment" src="Diploma_Segment/Diploma_Segment.dlg" />
        <Dialog name="dean_invitation" src="dean_invitation/dean_invitation.dlg" />
        <Dialog name="student_calls" src="student_calls/student_calls.dlg" />
        <Dialog name="group_congrats" src="group_congrats/group_congrats.dlg" />
        <Dialog name="student1_wait" src="student1_wait/student1_wait.dlg" />
        <Dialog name="student2_wait" src="student2_wait/student2_wait.dlg" />
        <Dialog name="student2_call" src="student2_call/student2_call.dlg" />
    </Dialogs>
    <Resources>
        <File name="suit picture" src="html/pics/suit_picture.png" />
        <File name="Graduation_Welcome" src="html/pics/Graduation_Welcome.jpg" />
        <File name="class_of_2026_pic" src="html/pics/class_of_2026_pic.png" />
        <File name="congrats_photo" src="html/pics/congrats_photo.jpg" />
        <File name="diploma_picture" src="html/pics/diploma_picture.png" />
        <File name="seating_map" src="html/pics/seating_map.png" />
        <File name="seats" src="html/pics/seats.png" />
        <File name="wlc" src="html/pics/wlc.jpg" />
        <File name="diploma_segment" src="html/css/diploma_segment.css" />
        <File name="diploma_segment" src="html/js/diploma_segment.js" />
        <File name="diploma_segment" src="html/pages/diploma_segment.html" />
        <File name="applause2" src="sounds/applause2.ogg" />
        <File name="bonuspts" src="sounds/bonuspts.ogg" />
        <File name="gamepositive" src="sounds/gamepositive.ogg" />
        <File name="glitch" src="sounds/glitch.ogg" />
        <File name="intro" src="sounds/intro.ogg" />
        <File name="itempop" src="sounds/itempop.ogg" />
    </Resources>
    <Topics>
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="Diploma_Segment_enu" src="Diploma_Segment/Diploma_Segment_enu.top" topicName="Diploma_Segment" language="en_US" />
        <Topic name="dean_invitation_enu" src="dean_invitation/dean_invitation_enu.top" topicName="dean_invitation" language="en_US" />
        <Topic name="student_calls_enu" src="student_calls/student_calls_enu.top" topicName="student_calls" language="en_US" />
        <Topic name="group_congrats_enu" src="group_congrats/group_congrats_enu.top" topicName="group_congrats" language="en_US" />
        <Topic name="student1_wait_enu" src="student1_wait/student1_wait_enu.top" topicName="student1_wait" language="en_US" />
        <Topic name="student2_wait_enu" src="student2_wait/student2_wait_enu.top" topicName="student2_wait" language="en_US" />
        <Topic name="student2_call_enu" src="student2_call/student2_call_enu.top" topicName="student2_call" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
