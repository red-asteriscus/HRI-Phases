<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="Seating" src="Seating/Seating.dlg" />
        <Dialog name="Attendance" src="Attendance/Attendance.dlg" />
        <Dialog name="SeatHelp" src="SeatHelp/SeatHelp.dlg" />
        <Dialog name="Time" src="Time/Time.dlg" />
    </Dialogs>
    <Resources>
        <File name="suit picture" src="html/pics/suit_picture.png" />
        <File name="seating_map" src="html/pics/seating_map.png" />
        <File name="arrival" src="html/css/arrival.css" />
        <File name="arrival" src="html/js/arrival.js" />
        <File name="arrival" src="html/pages/arrival.html" />
        <File name="seating_map" src="html/pics/seating_map.jpg" />
    </Resources>
    <Topics>
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="Seating_enu" src="Seating/Seating_enu.top" topicName="Seating" language="en_US" />
        <Topic name="Attendance_enu" src="Attendance/Attendance_enu.top" topicName="Attendance" language="en_US" />
        <Topic name="SeatHelp_enu" src="SeatHelp/SeatHelp_enu.top" topicName="SeatHelp" language="en_US" />
        <Topic name="Time_enu" src="Time/Time_enu.top" topicName="Time" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
