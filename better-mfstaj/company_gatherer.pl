# Mfstaj'daki şirketlerin tamamını bir array'e anonim hash referansları şeklinde yığan ve \
# (Haziran 19' eklentisi): direkt olarak index.html'deki "all_companies" id'li tbody'nin innerHTML'ine yazan program.
# (Temmuz 20'): sayfa sayısı dinamik elde ediliyor.
# 19.04.19', mayd@hk
use strict;
use warnings;
use feature "say";

=format of an element:
my $company = {	company => "Alarko Carrier San. ve Tic. A.Ş",
				city => "Kocaeli",
				department => "IE",
				sector => "air-conditioning"
};
=cut

my $dir = "page_contents";

# Get the total number of pages
opendir(my $dh, $dir);
my $num_pages = () = readdir($dh);

my @companies = ();          # of anonymous hashes, see above for the format

for (0..$num_pages-1) {
    my @ncds = ();           # name, city, department and sector holder
    my $company;
    my $row_data = 0;        # indicates we are in between <tr> and </tr> or not

    open my $FH, "<:encoding(utf-8)", $dir."/page_".$_.".txt";
    while(my $line = <$FH>) {
        chomp $line;
        left_trim($line);

        if($line =~ /<tr class="company" >/i) {
            $row_data = "begin";
            next;
        }
        elsif($row_data && $line =~ /<\/tr>/i) {
            $row_data = 0;
            $company = {
                    name =>         $ncds[0],
                    city =>         $ncds[1],
                    department =>   $ncds[2],
                    sector =>       $ncds[3]
            };
            push @companies, $company;
            @ncds = ();
        }

        if(!$row_data || $line eq "") {
            next;
        }
        else {
            next if($line !~ /^<\s*?td/i);
            my $data;
            if(@ncds == 3) {
                ($data) = $line =~ />(.*?)</;                                   # a little trick :) for sector retrieval (for it might be empty sometimes)
                ($data) = ($line =~ /(>(.+))$/g)[-1] unless defined $data;      # if the line is not properly terminated with </td>, get till the end of line
            }
            else {
				($data) = $line =~ />(.+?)<\s*\//g;                                 # try to get the data between <td> and </td>
				($data) = ($line =~ /(>(.+))$/g)[-1] unless $data;                  # if the line is not properly terminated with </td>, get till the end of line

				if($data =~ /(>(.+))$/g) {
					$data = $2;
				}                                                                   # if nested element detected, keep going to the deepest data
				while($data && $data =~ />(.+)<\s*\//g) {
					$data = $1;
				}
				# $data =~ s/<\s*?\/\s*?a\s*?>//i;                                  # interesthing: removal of </a>
				next unless defined $data;
			}
        push @ncds, full_trim($data);
        }
    }
    close $FH;
}
say "Number of companies: ", scalar @companies;


=format of a company dom element

<tr id = "ci" class="company" >
	<td class="companyName"><a href="#"> NAME</a> </td>
	<td align="center">Ankara</td>
	<td align="center">EE</td>
	<td align="center"></td>
</tr>

=cut

# haziran 19', artık .txt'e yazmak yerine direk (index.html's) innerHTML'ini set ediyor
open my $FH_IN, "<:encoding(utf-8)", "index.html";
open my $FH_OU, ">:utf8", "indexNEW.html";

my $i = 1;
my $todo = 1;
while (<$FH_IN>) {
	if (/<tbody id = "all_companies">/../<\/tbody>/ ) {
		if($todo) {
			print $FH_OU "<tbody id = \"all_companies\">\n";
			foreach (@companies) {
				my %data_holder = %{$_};

            full_trim($data_holder{name});
            full_trim($data_holder{city});
            full_trim($data_holder{department});
            full_trim($data_holder{sector});

            print $FH_OU "<tr id = \"c$i\" class=\"companyField\" >
				<td id = \"c$i-name\">$data_holder{name}</td>
				<td id = \"c$i-city\" align=\"center\">$data_holder{city}</td>
				<td id = \"c$i-dept\" align=\"center\">$data_holder{department}</td>
				<td id = \"c$i-sect\" align=\"center\">$data_holder{sector}</td>
				</tr>\n";

				++$i;
			}
			print $FH_OU "</tbody>\n";
		}
		$todo = 0;
	}
	else {
		print $FH_OU $_
	}
}
# close filehandles
close $FH_IN;
close $FH_OU;

# delete current index.html and rename indexNEW.html to index.html (in that order!)
unlink "index.html" or die "Couldn't remove index.html.. $!";
rename "indexNEW.html", "index.html";

say "Finished";

# Trimmer functions (they directly manipulate the input and ~return) << retireved from and modified: https://perlmaven.com/trim >>
sub left_trim  { $_[0] =~ s/^\s+//;  $_[0]       };
sub right_trim { $_[0] =~ s/\s+$//;     $_[0]    };
sub full_trim  { $_[0] =~ s/^\s+|\s+$//g;  $_[0] };
