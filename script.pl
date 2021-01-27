#! /usr/bin/perl

#
#use warnings;
#
use File::Basename;

use Socket;
# author Marco Roveri

$HOMENAME="nuxmv";

# The root of the WWW pages
$home='/www/es/html/tools/nuxmv';

# The binary file to be served
$binary=basename(__FILE__);

# The source file to be served
$nusmvsrc="${home}/data/data-$binary";

# The NuSMV home page
$homedoc='https://es.fbk.eu/tools/nuxmv';

# The database of user files
$database = "${home}/data/downloads.txt";

# The recipint to whom the notification of dowloading will be sent
$real_recipient = 'nuxmv@list.fbk.eu';
$recipient = 'nuxmv@list.fbk.eu';
$recipients = 'nuxmv@list.fbk.eu';
#$replyto = 'noreply@fbk.eu';
$replyto = 'nuxmv@list.fbk.eu';

# the program used to sent E-Mail
$mailprog = '/usr/lib/sendmail -t';

# The time of download
$now_string = localtime;

open (DATA, "<$nusmvsrc") || &generic_error("Cannot access file $binary");

open (DATAFILE, ">> $database") || &generic_error("Cannot open User Database!\n");
open (MAIL, "|$mailprog $recipients") || &generic_error("Cannot open Mail Program!\n");

print DATAFILE "\n\n########## New $binary Download ##########\n";
print DATAFILE "A download of \"$binary\" has been performed from the host below\n";
print DATAFILE "Server protocol: $ENV{'SERVER_PROTOCOL'}\n";
print DATAFILE "Remote IP address: $ENV{'REMOTE_ADDR'}\n";
print DATAFILE "HostName: $ENV{'REMOTE_HOST'} $name\n";
print DATAFILE "Remote User: $ENV{'REMOTE_USER'}\n";
print DATAFILE "Remote Ident: $ENV{'REMOTE_IDENT'}\n";
print DATAFILE "\n########## Additional Information about the host ##########\n";
print DATAFILE "Download date: $now_string\n";

print MAIL "From: nuXmv <$real_recipient>\n";
print MAIL "To: $recipients\n";  # this is an ugly hack
print MAIL "Reply-To: <$replyto>\n";
print MAIL "Subject: [nuxmv-download] New $binary Download\n";
print MAIL  "\n########## New $binary Download ##########\n\n";
print MAIL "A download of \"$binary\" has been performed from the host below\n\n";
print MAIL "Server protocol: $ENV{'SERVER_PROTOCOL'}\n";
print MAIL "HostName: $ENV{'REMOTE_HOST'} $name\n";
print MAIL "Remote IP address: $ENV{'REMOTE_ADDR'}\n";
print MAIL "Remote User: $ENV{'REMOTE_USER'}\n";
print MAIL "Remote Ident: $ENV{'REMOTE_IDENT'}\n";
print MAIL "Download date: $now_string\n";
print MAIL "\n########## Additional Information about the host #########\n";
($a, $b, $c, $d)=split(/\./,$ENV{'REMOTE_ADDR'});
open(PIPEIN,"nslookup -q=any ${d}.${c}.${b}.${a}.in-addr.arpa. |") ||  &generic_error("Cannot open nslookup pipe!\n");
while(<PIPEIN>) {
    print DATAFILE $_;
    print MAIL $_;
    next;
}
open(PIPEIN,"host $ENV{'REMOTE_ADDR'} |") ||  &generic_error("Cannot open host pipe!\n");
while(<PIPEIN>) {
    print DATAFILE $_;
    print MAIL $_;
    next;
}
print DATAFILE "########################################\n";
print MAIL     "########################################\n";

close(DATAFILE);
close(MAIL);

#  nslookup -q=any 2.7.251.130.in-addr.arpa.
# print STDOUT "Content-type: application/zip; name=\"${binary}\"\n" ;
if ($binary eq "nuxmv-user-manual.pdf") {
    print STDOUT "Content-type: application/pdf; name=\"${binary}\"\n" ;
}
else {
    print STDOUT "Content-type: application/x-tar; name=\"${binary}\"\n" ;
}
print STDOUT "Content-Disposition: attachment; filename=\"${binary}\"\n\n" ;
($dev,$ino,$mode,$nlink,$uid,$gid,$rdev,$size,$atime,$mtime,$ctime,$blksize,$blocks) = stat($nusmvsrc);

read(DATA, $FILEDATA, $size);
print STDOUT "$FILEDATA";
close(DATA);

close(STDOUT);

exit;


# ------------------------------------------------------------
# subroutine blank_response

sub generic_error
{
    my $cerror = $_[0];
    print "Content-type: text/html\n\n";
    print "<head><title>Download Error</title></head>";
    print "<base href=\"https://es.fbk.eu/tools/nuxmv\">";
    print "<body  bgcolor=\"#fffff\"><h1>Download Error</h1>\n<hr width=\"520\" align=\"left\">";
    print "<table width=\"520\" border=0 cellspacing=3 cellpadding=3>\n<tr><td align=\"left\">";
    print "Please return to the <a href=\"$homedoc\">previous</a> page using the \"back\" button or contact the authors.";
    print "</td></tr>\n";
    print "$cerror\n";
    print "</table>\n";
    print "<hr width=\"520\" align=\"left\">\n";
    print "<a href=\"$homedoc\">$HOMENAME</a> ";
    print "</body>\n</html>\n";
    exit;
}
