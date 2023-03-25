# 3DWriterWeb

A web version of the 3DWriter project.

Let your 3D Printer do your handwriting.

## Manual Positioning
This feature allows to manually move the gantry wherever we want the origin of the writing to be. It is most useful to write on labels, parts or in other cases where we don't want to measure and carefully position objects on the bed.\
Set *Pen offset* to `[0, 0]` and position all the writing relative to where you will position the pen on the bed. The *Pen Down* should be set to `0` (or even `-0.1` if you have a spring mounted pen and want some better contact with the surface).

In XY-only mode, the gantry is fixed at *Pen Up* height during the offset setup. The pen will be lowered to *Pen Down* position for writing, relative to Z home position. XY movements will be relative to the position chosen at the start of the print.\
This mode is useful if you don't want the pen to touch the writing surface during the origin setup.

**Printing multiple files:** if you plan to print multiple drawings consecutively (separate gcode files) you must either check *Home Z* or home Z axis manually before each print.