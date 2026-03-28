#!/usr/bin/env python3

#to read a file and produce a hexdump of it as a .txt file
#version 0.1 by A.F. Wilson 23-May-2022
#setup for A4 page width

import tkinter.messagebox as msgbox
from tkinter.filedialog import asksaveasfilename
from tkinter.filedialog import askopenfilename
import os

#standardised header with system variables is 619 bytes long, however, many programs saved on MTX or MEMU can be longer or shorter than this. 
#if 1st byte is 0xFF then its a MTX program file
#next 15 bytes are the filename in ASCII (padded with spaces if less than 15 chars)
#next 2 bytes are the file size in little endian format (LSB first) are header marker start
#scan remaining bytes until find a match to these 2 bytes, preceded by 3 0x00 bytes to find the end of the header and start of the system variables
#the system variables section is 246 (adjusted for the five bytes above) bytes long (in MTX memory this starts at 0xFA50 starting at the 5 bytes above.)
#read byte at 0xFA71 (offset of +42 from 0) confirms if MTX500 =0 or MTX512 = 1
#Next section is the program (BASIC) data in tokenised byte format and z80 assembly opcode bytes. 
#Final section is the NODDY section, mostly ascii text data.


def hexdump_file_to_txt(): #read 
    GV_fname_r="Rtest"
    GV_fname_w="Wtest"
    GC_extn_r=".mtx" 
    GC_extn_w=".txt"

    heading1=": "+"Contents in hexadecimal byte format (0x dropped)     "+"ASCII character"
    heading2="MTX file potentially detected, hexdump will split up accordingly"
    heading3="ASCII or non-MTX file"
    heading4="TAPE HEADER (excluding saved system variables)"
    heading5="SAVED SYSTEM VARIABLES"
    heading6="BASIC tokenised listing and z80 opcodes in byte format"
    heading7="NODDY text section"

    dec_val=0 #initialised.
    mtxflag=False
    dec_addr=-16 #increments of 16 starting at 0.
    hex_addr_str=""
    hdr_str="" 
    mtx500=32768 # 0x8000
    mtx512=16384 # 0x4000
    basaddr=mtx512 #default
    bastopaddr=mtx512 #default
    nodaddr=basaddr #default
    sysvaraddr=64080 # 0xFA50
    sysvarlen=251
    marker1=0
    marker2=0
    markercnt=0
    markerflag=False
    sysvarflag=False
    codeflag=False
    noddyflag=False
    tmp_def=[0 for r in range(16)]
    tmp=tmp_def.copy()
    hdrend=0

    def getdata(passdata=[], passlines=16, passresidual=0, passaddr=0, passcnt=0):
        #uses same variables as main function: tmp_def and formatdata function
        for s in range(passlines): #number of 16 byte blocks
            passdata=tmp_def #reset
            passaddr=passaddr+16
            for j in range (0,16): #end range is +1
                dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES
                passcnt=passcnt+1
                passdata[j]=dec_val
            #end for
            formatdata(passdata,16,passaddr)
        #end for
        if passresidual>0: #avoid spurious extra blank line with a repeat address
            passdata=tmp_def #reset
            passaddr=passaddr+16
            for j in range (0,passresidual): #end range is +1
                dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES
                passcnt=passcnt+1
                passdata[j]=dec_val
            #end for
            formatdata(passdata,passresidual,passaddr)
        return (passdata,passaddr,passcnt)

    def formatdata(passdata=[],passcnt=16, passaddr=0):
        #uses same variables as main function: fn_r_size and fn_w
        #every 16 bytes, new line. also a space between every entry
        if fn_r_size<2**16: #16-bit
            hex_addr_str="0x"+str('%04x' % passaddr)+" : "
        elif fn_r_size>=2**16 and fn_r_size<2**32: #32-bit
            hex_addr_str="0x"+str('%08x' % passaddr)+" : "
        else: #64-bit
            hex_addr_str="0x"+str('%16x' % passaddr)+" : "
        if passdata!=[] or passdata!=None:
            prt_char="     " #space between hexdump and ascii info
            fn_w.write(hex_addr_str) #print address as 0x0000
            for j in range (0,passcnt): #end range is +1
                dec_val=passdata[j]
                if dec_val in range(32,128): #printable
                    prt_char=prt_char+chr(dec_val) #no spaces
                else:
                    prt_char=prt_char+"." #not ideal prefer it used the extended character set
                hex_val='%02x' % dec_val #prints byte as ff (note is use 02X prints as FF)
                fn_w.write(hex_val) 
                fn_w.write(chr(32)) #space between each hex value to make it more legible
            #end for
            if passcnt<16: #need to adjust additional spaces between hex and ascii.
                for i in range(16-passcnt):
                    fn_w.write(chr(32)+chr(32)+chr(32)) #space between each hex value to make it more legible
                #end for
            fn_w.write(prt_char) #ascii version
            fn_w.write('\n') #EOL


    msgbox.showinfo(title="MTX Hexdump",message="This program reads a file and produces a corresponding text file showing the byte data (hexadecimal) and ASCII characters.\n" \
                    "Option to select a customised version for the Memotech MTX computer.\n" )

    GV_fname_r = askopenfilename(title="Binary (Program) input filename",defaultextension=GC_extn_r, filetypes=[("Binary (Program) files", GC_extn_r),("COM files", "*.COM"),("EXE files", "*.exe"),("All files","*.*")])
    #print("write conversion out as a text hex/ascii file (*.txt)")
    GV_fname_w = asksaveasfilename(title="Hexdump output filename", defaultextension=GC_extn_w, filetypes=[("TEXT files", GC_extn_w),("All files","*.*")]) 
    
    if GV_fname_r and GV_fname_w:
        fn_r_size=os.path.getsize (GV_fname_r) #replaces GC_array_rows

        fn_r=open(GV_fname_r, 'rb')
        #is it mtx file or not?

        dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES 
        hdrend=hdrend+1
        if dec_val!=255: #if first byte is 0xFF then its a MTX program file, so do not skip the 619 byte header but affects how the hexdump output will look like
            mtxflag=False
        else:
            mtxflag=True
            for i in range(15): #1st byte of block of 16 already read
                dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES 
                hdrend=hdrend+1
            #end for
            marker1=int.from_bytes(fn_r.read(1),"little") #READ BYTES
            marker2=int.from_bytes(fn_r.read(1),"little") #READ BYTES  
            hdrend=hdrend+2
            tmp_marker_def=[0,0,0,242,248]
            tmp_marker=[0,0,0,0,0]
            tmp_marker[3]=marker1
            tmp_marker[4]=marker2
            tmp_wip=tmp_marker.copy()
            while mtxflag is True:
                #skip the next section of the tape header until find the system variable section
                dec_val=int.from_bytes(fn_r.read(1),"little")
                hdrend=hdrend+1
                tmp_wip.pop(0)
                tmp_wip.append(dec_val)
                if tmp_wip==tmp_marker or tmp_wip==tmp_marker_def:
                    #print("TEST: marker block=",tmp_wip)
                    markerflag=True
                    break #exit while loop
                #end if
            #end while
        #end if-else
        fn_r.close()

        with open(GV_fname_r, 'rb') as fn_r: #read file plus byte rb
            with open(GV_fname_w, 'w') as fn_w: #if read available, open write to save listing as text
                try:
                    # b'' means a byte
                    # b'\xhh' is escape sequence (\x) followed by a hex value
                    i=1
                    #add a option for user to ignore mtx mode
                    
                    if mtxflag is True: #if first byte is 0xFF then its likely to be a MTX program file, so do not skip the 619 byte header but affects how the hexdump output will look like
                        answer=msgbox.askyesno(title="MTX Hexdump",message="MTX program detected,\n OK with customised hexdump?")
                        if answer is True:
                            fn_w.write(heading2)
                        else:
                            mtxflag=False
                            fn_w.write(heading3)
                    else: 
                        fn_w.write(heading3)
                    #end if-else
                    fn_w.write('\n\n') #EOL and a new line

                    if mtxflag is False:
                        while i<fn_r_size+1:
                            prt_char="     " #space between hexdump and ascii info
                            dec_addr=dec_addr+16
                            if fn_r_size<2**16: #16-bit
                                hex_addr_str="0x"+str('%04x' % dec_addr)+" : "
                            elif fn_r_size>=2**16 and fn_r_size<2**32: #32-bit
                                hex_addr_str="0x"+str('%08x' % dec_addr)+" : "
                            else: #64-bit
                                hex_addr_str="0x"+str('%16x' % dec_addr)+" : "
                            #end if-elif-else
                            if i==1: #print header. still to adjust for hex_addr_str size
                                #print header. still to adjust for hex_addr_str size
                                hdr_pad="                     " #21 spaces
                                hdr_str="Address"+hdr_pad[9:len(hex_addr_str)]+heading1
                                fn_w.write(hdr_str)
                                fn_w.write('\n') #EOL
                            fn_w.write(hex_addr_str) #print address as 0x0000
                            for j in range (0,16): #end range is +1
                                if i>fn_r_size: #check if end of file
                                    i=fn_r_size+1
                                    break #exit FOR loop
                                #end if
                                dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES
                                i=i+1
                                if dec_val in range(32,128): #printable
                                    prt_char=prt_char+chr(dec_val) #no spaces
                                else:
                                    prt_char=prt_char+"." #not ideal prefer it used the extended character set
                                hex_val='%02x' % dec_val #prints byte as ff (note is use 02X prints as FF)
                                fn_w.write(hex_val) 
                                fn_w.write(chr(32)) #space between each hex value to make it more legible
                            if fn_r_size%16>0 and i>fn_r_size: #if remainder >zero and end of read file
                                for r in range(0,(16-fn_r_size%16)):
                                    prt_char="   "+prt_char #add extra spaces (3 per byte) so that the ascii bit aligns properly
                            fn_w.write(prt_char) #ascii version
                            fn_w.write('\n') #EOL
                        #end while

                    else: #splt up into blocks for easier disassembly (MTX customisation mode).
                        while True:
                            #previously variable length section but now known (hdrend-5)
                            if markerflag is True:
                                #print header. still to adjust for hex_addr_str size
                                hdr_pad="                     " #21 spaces
                                hdr_str="Address"+hdr_pad[9:len(hex_addr_str)]+heading1
                                fn_w.write(hdr_str)
                                fn_w.write('\n') #EOL
                                fn_w.write('\n') #EOL
                                fn_w.write(heading4+'\n') #EOL
                                hdrlen=hdrend-5 #don't show last 5 bytes as these are part of sysvars
                                hdrresidual=hdrlen % 16 
                                hdrlines= int(hdrlen/16)
                                (tmp,dec_addr,i) = getdata(tmp, hdrlines, hdrresidual, dec_addr, i)
                                #reset flag
                                markerflag=False
                                #set flag
                                sysvarflag=True

                            if sysvarflag is True and codeflag is False: 
                                fn_w.write('\n') #new line
                                fn_w.write(heading5+'\n') #EOL
                                dec_addr=sysvaraddr-16 #16 bytes re-added below  in for loop
                                sysresidual=sysvarlen % 16 
                                syslines= int(sysvarlen/16)
                                offset=0
                                for s in range (0,syslines): #15*16 = 240 + 11 bytes 
                                    tmp=tmp_def #reset
                                    dec_addr=dec_addr+16
                                    for j in range (0,16): #end range is +1
                                        dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES
                                        if offset==42: 
                                            if dec_val==0: #default is mtx512
                                                mtxaddr=mtx500
                                            elif dec_val==1:
                                                mtxaddr=mtx512
                                            #end if-elif
                                        elif offset==84:
                                            nodaddr=dec_val
                                        elif offset==85:
                                            nodaddr=(dec_val*256)+nodaddr
                                        elif offset ==87:
                                            bastopaddr=dec_val
                                        elif offset ==88:
                                            bastopaddr=(dec_val*256)+bastopaddr
                                        #end if-elif
                                        i=i+1
                                        offset=offset+1
                                        tmp[j]=dec_val
                                    #end for
                                    formatdata(tmp,16,dec_addr)
                                #end for
                                #return to reading single bytes again
                                if sysresidual>0: #avoid spurious extra blank line with a repeat address
                                    tmp=tmp_def #reset
                                    dec_addr=dec_addr+16
                                    for j in range (0,sysresidual): #end range is +1
                                        dec_val=int.from_bytes(fn_r.read(1),"little") #READ BYTES
                                        i=i+1
                                        offset=offset+1
                                        tmp[j]=dec_val
                                    #end for
                                    formatdata(tmp,sysresidual,dec_addr)
                                #reset sysvarflag
                                sysvarflag=False
                                codeflag=True
                            #end if

                            if codeflag is True and noddyflag is False:
                                #known length section
                                fn_w.write('\n') #new line
                                fn_w.write(heading6+'\n') #EOL
                                dec_addr=basaddr-16 #16 bytes re-added below in for loop
                                baslen=bastopaddr-basaddr
                                basresidual=baslen % 16 
                                baslines= int(baslen/16)
                                (tmp,dec_addr,i) = getdata(tmp, baslines, basresidual, dec_addr, i)
                                #reset flag
                                codeflag=False
                                if nodaddr==basaddr:
                                    break #end while
                                else:
                                    noddyflag = True
                                #end if-else
                            #end if

                            if noddyflag is True and nodaddr>basaddr:
                                #known length section
                                fn_w.write('\n') #new line
                                fn_w.write(heading7+'\n') #EOL
                                dec_addr=bastopaddr-16 #16 bytes re-added below  in for loop
                                nodlen=nodaddr-bastopaddr
                                nodresidual=nodlen % 16 
                                nodlines= int(nodlen/16)
                                (tmp,dec_addr,i) = getdata(tmp, nodlines, nodresidual, dec_addr, i)
                                #reset flag
                                noddyflag=False
                                break #end while
                            #end if
                        #end while
 
                except EOFError or IndexError:
                        fn_r.close()
                        fn_w.close()

            fn_r.close()
            fn_w.close()
    return

hexdump_file_to_txt()
#quit() #loads prompt to kill the window


