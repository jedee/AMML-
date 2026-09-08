import { may2026StaffAttendance, MayStaffAttendance } from './may_attendance_data';

export interface JuneLogEntry {
  inTime: string;
  outTime?: string;
}

// Map Day Number -> Staff SN -> Log Entry
export const june2026DailyLogs: Record<number, Record<number, JuneLogEntry>> = {
  1: { // Monday 01-06-2026
    20: { inTime: "06:14" }, // Yusuf Adamu
    25: { inTime: "06:15", outTime: "18:20" }, // Kabiru Abdullahi
    46: { inTime: "07:05", outTime: "17:18" }, // Joseph Michael
    49: { inTime: "07:40" }, // Issa Sulaiman
    37: { inTime: "08:20", outTime: "17:37" }, // Ayoola Joseph
    9:  { inTime: "08:26", outTime: "17:15" }, // Michael Okpantho
    6:  { inTime: "08:27", outTime: "17:05" }, // Musa J
    55: { inTime: "08:35", outTime: "17:15" }, // Ayinde Folashade
    48: { inTime: "08:39", outTime: "17:05" }, // Ngozi Dosaty (Dorathy Mgbi)
    53: { inTime: "08:39", outTime: "17:00" }, // Agu Precious
    2:  { inTime: "08:42", outTime: "18:10" }, // Innocent Amaechina
    31: { inTime: "08:43" }, // Thomas Mbowesa
    24: { inTime: "08:53", outTime: "17:15" }, // Sampson O.T.
    50: { inTime: "08:55", outTime: "17:00" }, // Amina Adamu
    21: { inTime: "08:58" }, // Sunday Chindo
    5:  { inTime: "09:05", outTime: "17:18" }, // Efosa Okosun
    18: { inTime: "09:05" }, // Jatau F. Ayizaka
    30: { inTime: "09:06" }, // Ojeh Jedidah
    47: { inTime: "09:10", outTime: "17:15" }, // Brown Sam
    7:  { inTime: "09:10" }, // Ibrahim Saad
    26: { inTime: "09:10" }, // Ajio Benedict
    57: { inTime: "09:10", outTime: "17:37" }, // Eunice M. Bwala
    4:  { inTime: "09:11", outTime: "17:16" }, // Daniel Onoja
    40: { inTime: "09:12", outTime: "17:30" }, // Blessing Uzoh
    11: { inTime: "09:13" }, // Catherine Anindo
    44: { inTime: "09:13", outTime: "17:00" }, // Opeyemi Rofiat
    45: { inTime: "09:15", outTime: "17:20" }, // Idowu Awene
    51: { inTime: "09:16", outTime: "17:00" }, // Hamna Hassan (Hassana Haruna)
    36: { inTime: "09:16" }, // Mustapha Mukhtar
    28: { inTime: "09:16" }, // Happiness Igwe? (Happiness Ifeoma)
    34: { inTime: "09:20" }, // Hassan Aliyu
    1:  { inTime: "09:45", outTime: "17:34" }, // Obisi O. (Onya Ojiji)
    35: { inTime: "09:48", outTime: "17:28" }, // Baidi Aisha Gajo
    15: { inTime: "09:48" }, // Ome Idakwo (Janet Idakwo)
  },
  2: { // Tuesday 02-06-2026
    22: { inTime: "06:50", outTime: "17:20" }, // Bashiru Dauda
    25: { inTime: "06:55", outTime: "17:00" }, // Kabiru Abdullahi
    9:  { inTime: "08:05" }, // Michael Okpantho
    8:  { inTime: "08:20", outTime: "17:05" }, // Ugwu Ekechukwu
    57: { inTime: "08:23", outTime: "17:19" }, // Eunice Masari Bwala
    48: { inTime: "08:25" }, // Mgbi Dorothy Chisom
    30: { inTime: "08:26" }, // Ojeh Jedidah
    24: { inTime: "08:26", outTime: "17:45" }, // Sampson O.T.
    2:  { inTime: "08:30", outTime: "18:25" }, // Innocent Amaechina
    21: { inTime: "08:33" }, // Sunday Chindo
    6:  { inTime: "08:35" }, // Musa J
    50: { inTime: "08:35", outTime: "17:00" }, // Amina Adamu
    44: { inTime: "08:38", outTime: "17:00" }, // Opeyemi Rofiat
    38: { inTime: "08:40", outTime: "17:00" }, // Sangotoye A. Abigail
    11: { inTime: "08:40", outTime: "17:00" }, // Catherine Anindo
    18: { inTime: "08:45" }, // Jatau F. Ayizaka
    16: { inTime: "08:45" }, // Kolo Oforbo? (Williams Joy Okoi)
    26: { inTime: "08:54" }, // Ajio Benedict
    4:  { inTime: "08:54", outTime: "17:55" }, // Daniel Onoja
    35: { inTime: "09:00" }, // Baidi Aisha Gajo
    53: { inTime: "09:01", outTime: "17:02" }, // Agu Precious
    40: { inTime: "09:02", outTime: "17:15" }, // Blessing Uzoh
    55: { inTime: "09:02" }, // Ayinde Folashade
    49: { inTime: "09:02" }, // Issa Sulaiman
    5:  { inTime: "09:15" }, // Efosa Okosun
    45: { inTime: "09:18", outTime: "18:00" }, // Idowu Awene
    31: { inTime: "09:20" }, // Thompson Mbowesa
    20: { inTime: "09:24" }, // Yusuf Adamu
    36: { inTime: "09:25" }, // Mustapha Mukhtar
    32: { inTime: "09:25", outTime: "17:39" }, // Muhammed Fadel Isah
    1:  { inTime: "09:26", outTime: "17:03" }, // Obisi O. (Onya Ojiji)
    47: { inTime: "09:30", outTime: "17:30" }, // Brown Sarah
    13: { inTime: "09:31" }, // Amina Kabaraini
    51: { inTime: "09:31", outTime: "17:00" }, // Hanus Hassans
    56: { inTime: "09:39", outTime: "18:42" }, // Shagari Osu (Shafiu Abbas)
    7:  { inTime: "09:45" }, // Ibrahim Saad
  },
  3: { // Wednesday 03-06-2026
    25: { inTime: "06:54", outTime: "17:10" }, // Kabiru Abdullahi
    22: { inTime: "06:55", outTime: "17:10" }, // Bashiru Dauda
    46: { inTime: "07:55" }, // Joseph Micheal T.
    43: { inTime: "08:05", outTime: "17:00" }, // Halima Mutu Rabiu
    37: { inTime: "08:19", outTime: "18:30" }, // Ayoola Joseph
    8:  { inTime: "08:25", outTime: "17:05" }, // Ugwu Ekechukwu
    57: { inTime: "08:31", outTime: "17:18" }, // Eunice Marovi Bwala
    24: { inTime: "08:36", outTime: "17:10" }, // Sampson O.T.
    2:  { inTime: "08:37", outTime: "18:20" }, // Innocent Amaechina
    53: { inTime: "08:40", outTime: "17:00" }, // Agu Precious
    6:  { inTime: "08:43", outTime: "17:05" }, // Musa J
    11: { inTime: "08:44", outTime: "17:00" }, // Catherine Anindo
    30: { inTime: "08:44" }, // Ojeh Jedidah
    44: { inTime: "08:45" }, // Opeyemi Rofiat
    4:  { inTime: "08:46", outTime: "17:55" }, // Daniel Onoja
    54: { inTime: "08:50" }, // Agetu Vera
    56: { inTime: "08:53", outTime: "18:40" }, // Shagari Osu
    38: { inTime: "08:55", outTime: "17:00" }, // Sangotoye A. Abogail
    15: { inTime: "08:55", outTime: "17:30" }, // Jane Jumbo (Janet Idakwo)
    48: { inTime: "08:56", outTime: "17:00" }, // Mgbi Dorothy
    31: { inTime: "08:57" }, // Thompson Mbonesu
    28: { inTime: "08:57" }, // Happiness Ifoma
    5:  { inTime: "09:10", outTime: "17:10" }, // Efosa Okosun
    34: { inTime: "09:15" }, // Hassan Aliyu
    9:  { inTime: "09:15", outTime: "17:15" }, // Michael Okpewho
    40: { inTime: "09:15", outTime: "17:20" }, // Uzoh Blessing
    7:  { inTime: "09:17" }, // Ibrahim Saad
    36: { inTime: "09:18", outTime: "17:05" }, // Mustapha Mukhtar
    51: { inTime: "09:18", outTime: "17:00" }, // Haruna Hassana
    33: { inTime: "09:20" }, // Kelechi Okoro
    18: { inTime: "09:20" }, // Jatau F. Ayizaka
    52: { inTime: "09:30", outTime: "17:00" }, // Kabir Usman
    32: { inTime: "09:30", outTime: "17:00" }, // Muhammed Fadeel Isah
    1:  { inTime: "10:35", outTime: "17:54" }, // Obisi O. (Onya Ojiji)
    26: { inTime: "10:35" }, // Ajio Benedict
    20: { inTime: "10:36", outTime: "17:45" }, // Yusuf Adamu
    49: { inTime: "09:10" }, // Issa Sulaiman
  },
  4: { // Thursday 04-06-2026
    22: { inTime: "06:55", outTime: "17:10" }, // Bashiru Dauda
    25: { inTime: "06:59", outTime: "17:11" }, // Kabiru Abdullahi
    14: { inTime: "08:02" }, // Nnazu M. Alim (Nansah Abashe)
    9:  { inTime: "08:12", outTime: "17:05" }, // Michael Okpewho
    43: { inTime: "08:13", outTime: "17:16" }, // Halima Mutu Rabiu
    37: { inTime: "08:15", outTime: "18:00" }, // Ayoola Joseph
    8:  { inTime: "08:16", outTime: "17:05" }, // Ugwu Ekechukwu
    6:  { inTime: "08:20", outTime: "17:10" }, // Musa J
    24: { inTime: "08:29", outTime: "17:50" }, // Sampson O.T.
    46: { inTime: "08:34" }, // Joseph Micheal T.
    21: { inTime: "08:35" }, // Sunday Chindo
    26: { inTime: "08:35" }, // Ajio Benedict
    57: { inTime: "08:42", outTime: "17:09" }, // Eunice Marovi Bwala
    29: { inTime: "08:43", outTime: "17:50" }, // S. M. Musapora (Salihu Mustapha)
    2:  { inTime: "08:46", outTime: "18:08" }, // Innocent Amaechina
    11: { inTime: "08:47", outTime: "17:00" }, // Catherine Anindo
    44: { inTime: "08:48", outTime: "17:01" }, // Opeyemi Rofiat
    45: { inTime: "08:50", outTime: "17:20" }, // Idowu Awand
    56: { inTime: "08:53", outTime: "18:00" }, // Shagari Osu
    49: { inTime: "08:55" }, // Issa Sulaiman
    5:  { inTime: "09:05", outTime: "17:25" }, // Efosa Okosun
    31: { inTime: "09:06" }, // Thompson Mbonuosa
    48: { inTime: "09:08" }, // Ngozi Dorothy Chisom
    4:  { inTime: "09:09", outTime: "17:55" }, // Daniel Onoja
    55: { inTime: "09:10", outTime: "17:00" }, // Ayinde Folashade
    7:  { inTime: "09:12", outTime: "17:00" }, // Ibrahim Saad
    18: { inTime: "09:15", outTime: "17:42" }, // Jatau F. Andaku (John Friday Anzaku)
    36: { inTime: "09:15", outTime: "17:00" }, // Mustapha Mukhtar
    32: { inTime: "09:15" }, // Muhammed Fadel Isah
    20: { inTime: "09:54", outTime: "17:47" }, // Yusuf Adamu
    38: { inTime: "09:55", outTime: "17:04" }, // Sangotoye A. Abigail
    52: { inTime: "09:56", outTime: "17:00" }, // Kabir Usman
    1:  { inTime: "09:58", outTime: "17:30" }, // Obisi O. (Onya Ojiji)
    3:  { inTime: "10:15" }, // Famle B. (Faruk Baffa)
    34: { inTime: "09:10" }, // Hassan Aliyu
  },
  5: { // Friday 05-06-2026
    22: { inTime: "06:55", outTime: "17:10" }, // Bashiru Dauda
    44: { inTime: "07:50", outTime: "17:50" }, // Opeyemi Rofiat
    14: { inTime: "08:08", outTime: "19:09" }, // Muazu M. Alimi (Nansah Abashe / Aliyu Magaji)
    6:  { inTime: "08:10", outTime: "17:13" }, // Musa T (Musa Shelleng)
    43: { inTime: "08:20", outTime: "17:06" }, // Halima Mutu Rabiu
    46: { inTime: "08:30" }, // Joseph Micheal T.
    57: { inTime: "08:30", outTime: "17:10" }, // Eunice Maravi Bwala
    53: { inTime: "08:31", outTime: "17:20" }, // Agu Precious
    24: { inTime: "08:35", outTime: "17:10" }, // Sampson O.T.
    3:  { inTime: "08:45" }, // Famli B. (Faruk Baffa)
    37: { inTime: "08:47", outTime: "13:00" }, // Ayoola Joseph
    56: { inTime: "08:49", outTime: "18:15" }, // Shagari Osu
    8:  { inTime: "08:53", outTime: "17:02" }, // Ugwu Ekechukwu
    51: { inTime: "08:51" }, // Hanus Hassana
    2:  { inTime: "08:55", outTime: "17:40" }, // Innocent Amaechina
    55: { inTime: "08:55", outTime: "17:30" }, // Ayinde Folashade
    45: { inTime: "08:52", outTime: "17:20" }, // Idaewon Awans
    29: { inTime: "09:00", outTime: "17:27" }, // S M Mustapha
    4:  { inTime: "09:02", outTime: "17:58" }, // Daniel Onoja
    40: { inTime: "09:14", outTime: "17:04" }, // Doa Blessing (Blessing Uzoh)
    33: { inTime: "09:16" }, // Kelechi Okoro
    18: { inTime: "09:16" }, // Jatau F. Anzaku
    38: { inTime: "09:20", outTime: "17:05" }, // Sangotoye A. Abigail
    21: { inTime: "09:02" }, // Sunday Chindo
    36: { inTime: "09:23", outTime: "17:10" }, // Mustapha Mukhtar
    1:  { inTime: "10:00", outTime: "16:10" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "10:02", outTime: "19:07" }, // Yusuf Adamu
    47: { inTime: "10:02", outTime: "17:00" }, // Brown Sarah T
    34: { inTime: "10:05" }, // Hassan Aliyu
    7:  { inTime: "10:20" }, // Ibrahim Saad
  },
  6: { // Saturday 06-06-2026 (Weekend)
    14: { inTime: "09:35", outTime: "15:13" }, // Muazu M. Aligun (Nansah Abashe)
    4:  { inTime: "10:31", outTime: "16:00" }, // Daniel Onoja
    18: { inTime: "11:11", outTime: "16:32" }, // Jatau F. Anzaku
  },
  9: { // Tuesday 09-06-2026
    22: { inTime: "06:50", outTime: "17:10" }, // Bashiru Dauda
    25: { inTime: "06:55", outTime: "17:10" }, // Kabiru Abdullahi
    26: { inTime: "06:58" }, // Ajio Benedict
    30: { inTime: "07:00" }, // Ojeh Jedidah
    19: { inTime: "08:14" }, // Muazu M. Aliyu (Aliyu Magaji)
    43: { inTime: "08:20", outTime: "17:00" }, // Halima Mutu Rabiu
    27: { inTime: "08:23", outTime: "17:15" }, // Yusuf J (Yusuf Ismail)
    39: { inTime: "08:25", outTime: "17:15" }, // Bm Yusuf
    53: { inTime: "08:35", outTime: "17:03" }, // Agu Precious
    21: { inTime: "08:37" }, // Sunday Chindo
    57: { inTime: "08:41", outTime: "17:45" }, // Eunice Maravi Bwala
    28: { inTime: "08:42" }, // Happiness Ifeoma
    24: { inTime: "08:43", outTime: "20:35" }, // Sampson O.T.
    29: { inTime: "08:43", outTime: "17:48" }, // S M Musapora
    38: { inTime: "08:49", outTime: "17:14" }, // Sangotoye A. Abigail
    2:  { inTime: "08:51", outTime: "17:55" }, // Innocent Amaechina
    34: { inTime: "08:55" }, // Hassan Aliyu
    4:  { inTime: "08:56", outTime: "17:20" }, // Daniel Onoja
    46: { inTime: "08:57" }, // Joseph Micheal T.
    9:  { inTime: "08:58", outTime: "17:15" }, // Michael Okpewho
    50: { inTime: "08:58", outTime: "17:00" }, // Amina Adamu
    18: { inTime: "08:58", outTime: "17:15" }, // Jatau F. Anzaku
    51: { inTime: "09:00" }, // Haruna Hassana
    45: { inTime: "09:00", outTime: "17:00" }, // Idaewon Awand
    17: { inTime: "09:00" }, // Isah U. Shaba (On Leave Call)
    55: { inTime: "09:00" }, // Ayinde Folashade
    35: { inTime: "09:05", outTime: "17:07" }, // Baidi Aisha Gajo
    8:  { inTime: "09:10" }, // Ugwu Ekechukwu
    40: { inTime: "09:14", outTime: "17:04" }, // Uzoh Blessing
    3:  { inTime: "09:15" }, // Faruk B.
    49: { inTime: "09:15" }, // Issa Sulaiman
    56: { inTime: "09:15", outTime: "18:30" }, // Shof Osas (Shafiu Abbas)
    5:  { inTime: "09:15", outTime: "17:23" }, // Efosa Okosin
    12: { inTime: "09:15", outTime: "17:50" }, // Ozichi Emelogu
    13: { inTime: "09:14", outTime: "17:15" }, // Amina Habarani
    31: { inTime: "09:17" }, // Thomson Mbonuosa
    36: { inTime: "09:18" }, // Mustapha Mukhtar
    7:  { inTime: "09:20" }, // Ibrahim Saad
    48: { inTime: "09:25" }, // Ngozi Dorothy Chisom
    33: { inTime: "09:34", outTime: "17:20" }, // Kelechi Okoro
    1:  { inTime: "09:48", outTime: "17:13" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "09:49", outTime: "17:06" }, // Yusuf Adamu
    52: { inTime: "09:50", outTime: "17:00" }, // Kabir Usman
    32: { inTime: "09:50", outTime: "17:35" }, // Muhammed Fedeel Isah
    11: { inTime: "09:50", outTime: "17:00" }, // Catherine Anunobi
  },
  10: { // Wednesday 10-06-2026
    25: { inTime: "06:07", outTime: "17:21" }, // Kabiru Abdullahi
    22: { inTime: "06:55", outTime: "17:10" }, // Bashiru Dauda
    35: { inTime: "08:00", outTime: "17:20" }, // Baide Aisha Gajo
    57: { inTime: "08:10", outTime: "17:11" }, // Eunice Marovi Bwala
    34: { inTime: "08:10" }, // Hassan Atiyu
    43: { inTime: "08:18", outTime: "17:00" }, // Halima Mutu Rabiu
    24: { inTime: "08:22", outTime: "17:40" }, // Sampson O.T.
    26: { inTime: "08:22" }, // Ajio Benedict
    46: { inTime: "08:33", outTime: "17:10" }, // Joseph Micheal T
    8:  { inTime: "08:40", outTime: "17:07" }, // Ugwu Ekechukwu
    27: { inTime: "08:40", outTime: "17:07" }, // Yusuf J
    51: { inTime: "08:42" }, // Haruna Hassana
    9:  { inTime: "08:44", outTime: "17:05" }, // Michael Okpewho
    39: { inTime: "08:47" }, // Bm Yusuf
    37: { inTime: "08:49", outTime: "17:30" }, // Ayoola Joseph
    44: { inTime: "08:49" }, // Opeyemi Rafat
    11: { inTime: "08:49", outTime: "17:03" }, // Catherine Apusodo (Catherine Anunobi)
    14: { inTime: "08:50" }, // Muazu M. Miju (Nansah Abashe)
    38: { inTime: "08:57", outTime: "17:00" }, // Sangotoye A. Abogail
    49: { inTime: "08:57", outTime: "17:17" }, // Issa Sulaiman
    2:  { inTime: "08:58" }, // Innocent Amaechina
    5:  { inTime: "09:00", outTime: "17:45" }, // Efosa Okosun
    4:  { inTime: "09:00", outTime: "17:18" }, // Daniel Onoja
    53: { inTime: "09:00", outTime: "17:05" }, // Agu Precious
    29: { inTime: "09:02", outTime: "17:24" }, // S M Musapora
    18: { inTime: "09:02", outTime: "17:16" }, // Jatau F. Anzaku
    30: { inTime: "09:02" }, // Ojeh Jedidah
    56: { inTime: "09:09", outTime: "17:23" }, // Shafin Jibrin (Shafiu Abbas)
    3:  { inTime: "09:10" }, // Faruk B.
    48: { inTime: "09:12" }, // Ngozi Dorothy
    33: { inTime: "09:13" }, // Okoro Kululu
    31: { inTime: "09:14" }, // Thomas Mbonuosa
    36: { inTime: "09:15", outTime: "17:05" }, // Mustapha Mukhtar
    17: { inTime: "09:15" }, // Isah Uman Shaba
    15: { inTime: "09:16" }, // Jane Doshu (Janet Idakwo)
    7:  { inTime: "09:20" }, // Ibrahim Saad
    12: { inTime: "09:20", outTime: "17:25" }, // Ozichi Emelogu
    28: { inTime: "09:20" }, // Happiness Ifeoma
    32: { inTime: "09:30", outTime: "18:00" }, // Muhammed Fedeel
    1:  { inTime: "10:30", outTime: "17:46" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "10:34" }, // Yusuf Adamu
    52: { inTime: "10:34", outTime: "17:00" }, // Kabir Usman
  },
  11: { // Thursday 11-06-2026
    28: { inTime: "09:12" }, // Happiness Ifeoma
    55: { inTime: "09:13", outTime: "17:30" }, // Ayinde Folashade
    38: { inTime: "09:15" }, // Sangotoye A. Abigail
    26: { inTime: "09:15" }, // Ajio Benedict
    1:  { inTime: "09:53", outTime: "17:55" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "09:54", outTime: "17:50" }, // Yusuf Adamu
    32: { inTime: "09:54", outTime: "17:00" }, // Muhammed Fedeel Isah
    45: { inTime: "11:08", outTime: "18:20" }, // Idaewu Awand
    52: { inTime: "11:08", outTime: "23:00" }, // Kabir Usman
    34: { inTime: "11:08" }, // Hassan Aliyu
  },
  12: { // Friday 12-06-2026
    17: { inTime: "10:00", outTime: "15:00" }, // Isah Usman Shaba
    20: { inTime: "10:22", outTime: "12:13" }, // Yusuf Adamu
    19: { inTime: "11:25", outTime: "18:35" }, // Muazu M. Aliyu
  },
  13: { // Saturday 13-06-2026
    37: { inTime: "09:00", outTime: "14:40" }, // Joseph Ayoola
    17: { inTime: "09:30", outTime: "15:00" }, // Isah Usman Shaba
    19: { inTime: "11:20", outTime: "18:33" }, // Muazu M. Aliyu
    46: { inTime: "11:30", outTime: "18:34" }, // Joseph Micheal T
  },
  14: { // Sunday 14-06-2026
    37: { inTime: "13:30", outTime: "17:25" }, // Joseph Ayoola
    46: { inTime: "13:38", outTime: "17:40" }, // Joseph Micheal T
  },
  15: { // Monday 15-06-2026
    20: { inTime: "06:15", outTime: "17:12" }, // Yusuf Adamu
    23: { inTime: "07:00", outTime: "17:20" }, // Haruna Moro Magaj
    25: { inTime: "07:02", outTime: "17:21" }, // Kabiru Abdullahi
    30: { inTime: "07:35" }, // Ojeh Jedidah
    37: { inTime: "07:50", outTime: "17:50" }, // Ayoola Joseph
    46: { inTime: "07:54", outTime: "17:35" }, // Joseph Micheali
    14: { inTime: "08:26" }, // Muazu M-Mum (Nansah Abashe)
    44: { inTime: "08:27", outTime: "17:35" }, // Opeyemi Rofiat
    35: { inTime: "08:28", outTime: "17:02" }, // Baidi Aisha Gajo
    24: { inTime: "08:33", outTime: "17:13" }, // Sampson O-T
    27: { inTime: "08:34", outTime: "17:11" }, // Yusuf J
    53: { inTime: "08:34", outTime: "17:05" }, // Agu Precious
    32: { inTime: "08:34" }, // Muhammed Fedeel Isa
    39: { inTime: "08:45" }, // Bm Yusuf
    55: { inTime: "08:45", outTime: "17:00" }, // Ayinde Folashade
    18: { inTime: "08:46" }, // Jatau F. Anzaku
    11: { inTime: "08:47", outTime: "17:00" }, // Catherine Anunobi
    48: { inTime: "08:51", outTime: "17:12" }, // Mgbi Sosaty Chisom (Dorathy Mgbi)
    21: { inTime: "08:53" }, // Sunday Chindo
    13: { inTime: "08:53", outTime: "17:10" }, // Amina Kabarani
    56: { inTime: "08:55", outTime: "17:40" }, // Shofin Jibrin (Shafiu Abbas)
    51: { inTime: "09:00" }, // Haruns Hassana
    54: { inTime: "09:06" }, // Agetu Vera
    49: { inTime: "09:08", outTime: "17:09" }, // Issa Sulaiman
    4:  { inTime: "09:01", outTime: "17:44" }, // Daniel Onoja
    17: { inTime: "09:06", outTime: "17:00" }, // Isah Usman Shaba
    50: { inTime: "09:10", outTime: "17:02" }, // Amina Adamu
    1:  { inTime: "09:10", outTime: "17:24" }, // Obisi Orya (Onya Ojiji)
    31: { inTime: "09:10" }, // Wanjol Mbonuosen (Thompson)
    7:  { inTime: "09:11" }, // Ibrahim Saad
    5:  { inTime: "09:13", outTime: "17:15" }, // Efoor Okosun (Efosa)
    45: { inTime: "09:15", outTime: "17:15" }, // Idaewn Awand
    40: { inTime: "09:16", outTime: "17:07" }, // Uzoh Blessing
    26: { inTime: "09:16" }, // Ajio Benedict
    36: { inTime: "09:17", outTime: "17:10" }, // Mustapha Mukhtar
    2:  { inTime: "09:52", outTime: "18:26" }, // Innocent Amaechina
    12: { inTime: "09:52", outTime: "17:25" }, // Ozichi Emelogu
    9:  { inTime: "09:57", outTime: "17:17" }, // Michael Okpewho
    33: { inTime: "09:58" }, // Kelulu Obozo (Kelechi)
    15: { inTime: "10:00", outTime: "17:00" }, // Jane Idahwo
    34: { inTime: "10:03" }, // Hassan Aliyu
  },
  16: { // Tuesday 16-06-2026
    22: { inTime: "06:50", outTime: "17:10" }, // Bashiru Dauda
    25: { inTime: "06:55", outTime: "17:51" }, // Kabiru Abdullahi
    23: { inTime: "07:00", outTime: "17:11" }, // Hamme Maro Magami
    19: { inTime: "08:20" }, // Muazu M. Aliyu
    30: { inTime: "08:21" }, // Ojeh Jedidah
    27: { inTime: "08:22", outTime: "17:05" }, // Yusuf I
    18: { inTime: "08:24" }, // Jatau F. Anzaku
    35: { inTime: "08:25", outTime: "17:00" }, // Baidi Aisha Gajo
    9:  { inTime: "08:30" }, // Michael Okpewho
    24: { inTime: "08:33", outTime: "17:35" }, // Sampson O.T.
    57: { inTime: "08:36", outTime: "17:14" }, // Eunice Moan Bush (Eunice Bwala)
    11: { inTime: "08:38", outTime: "17:00" }, // Catherine Ananda
    8:  { inTime: "08:45", outTime: "17:05" }, // Ugwu Ekechukwu
    29: { inTime: "08:48" }, // S M Mustapha
    50: { inTime: "08:50", outTime: "17:09" }, // Amina Adamu
    56: { inTime: "08:56" }, // Shafin Osia
    53: { inTime: "08:56", outTime: "17:05" }, // Agu Precious
    39: { inTime: "08:58", outTime: "17:50" }, // Bm Yusuf
    45: { inTime: "09:00", outTime: "17:15" }, // Ideewu Awand
    5:  { inTime: "09:02" }, // Efosa Okosun
    51: { inTime: "09:02" }, // Hanus Hassans
    38: { inTime: "09:02", outTime: "17:00" }, // Sangotoye A. Abogail
    55: { inTime: "09:02", outTime: "17:00" }, // Ayinde Folashade
    28: { inTime: "09:02" }, // Happiness Ifeomun
    13: { inTime: "09:03" }, // Amina Kabarau
    49: { inTime: "09:04", outTime: "17:02" }, // Issa Sulaiman
    48: { inTime: "09:12" }, // Mgbi Dorothy
    2:  { inTime: "09:15", outTime: "18:02" }, // Innocent Amaechina
    7:  { inTime: "09:10" }, // Ibrahim Saad
    12: { inTime: "09:16", outTime: "17:25" }, // Ozichi Emelogu
    17: { inTime: "09:20", outTime: "17:00" }, // Isah Uman Shaba
    40: { inTime: "09:20", outTime: "17:05" }, // Uzoft Blessing
    4:  { inTime: "09:22", outTime: "17:20" }, // Daniel Onoja
    36: { inTime: "09:23", outTime: "17:00" }, // Mustapha Mukhtar
    21: { inTime: "09:24" }, // Sunday Chindo
    33: { inTime: "09:25" }, // Kelechi Okere
    1:  { inTime: "09:54", outTime: "17:50" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "09:55", outTime: "17:49" }, // Yusuf Adamu
    31: { inTime: "09:59" }, // Thomson Mbonuosa
    26: { inTime: "09:59" }, // Ajio Benedict
    32: { inTime: "09:59" }, // Muhammed Fadeel Isah
    34: { inTime: "10:00" }, // Hassan Aliyu
  },
  17: { // Wednesday 17-06-2026
    22: { inTime: "06:40" }, // Bashiru Dauda
    25: { inTime: "06:55", outTime: "17:00" }, // Kabiru Abdullahi
    23: { inTime: "07:00" }, // Haruna Maro Magani
    24: { inTime: "08:02" }, // Sampson O.T.
    37: { inTime: "08:02", outTime: "17:50" }, // Ayoola Joseph
    27: { inTime: "08:30", outTime: "17:10" }, // Yusuf I
    53: { inTime: "08:30", outTime: "17:02" }, // Agu Precious
    39: { inTime: "08:40", outTime: "17:08" }, // Bm Yusuf
    8:  { inTime: "08:45", outTime: "17:05" }, // Ugwu Ekechukwu
    38: { inTime: "08:52", outTime: "18:07" }, // Sangotoye A. Abogail
    2:  { inTime: "08:53", outTime: "18:04" }, // Innocent Amaeduna
    29: { inTime: "08:56" }, // S M Mustapha
    26: { inTime: "08:57" }, // Ajio Benedict
    40: { inTime: "08:58", outTime: "17:12" }, // Uzoh Blessing
    4:  { inTime: "08:58", outTime: "17:44" }, // Daniel Onoja
    46: { inTime: "08:59", outTime: "17:10" }, // Joseph Micheal
    57: { inTime: "09:10", outTime: "17:14" }, // Eunice Maravi Buala
    56: { inTime: "09:16" }, // Shafiu Osia
    30: { inTime: "09:17" }, // Ojeh Jedidah
    19: { inTime: "09:26" }, // Mu'azu M-Alum
    5:  { inTime: "09:27", outTime: "17:15" }, // Efosa Okosun
    17: { inTime: "09:30" }, // Isah Usman Shaba
    31: { inTime: "09:31" }, // Thomson Mbonuosa
    36: { inTime: "09:32", outTime: "17:10" }, // Mustapha Mukhtar
    51: { inTime: "09:33", outTime: "17:00" }, // Hanus Hassan
    1:  { inTime: "09:37", outTime: "17:34" }, // Obisi O. (Onya Ojiji)
    20: { inTime: "09:38", outTime: "17:30" }, // Yusuf Adamu
    11: { inTime: "09:50" }, // Catherine Anunol
    48: { inTime: "09:50", outTime: "17:14" }, // Mgbi Dorothy
    49: { inTime: "09:50", outTime: "17:48" }, // Issa Sulaiman
    18: { inTime: "09:50" }, // Jatau F. Anzaku
    12: { inTime: "09:50", outTime: "17:50" }, // Ozichi Emelogu
    15: { inTime: "09:50" }, // Jane Idahwo
    28: { inTime: "09:50" }, // Happiness Ifeoma
    33: { inTime: "09:51" }, // Kelechi Okoro
    34: { inTime: "10:50" }, // Hassan Aliyu
    32: { inTime: "10:50", outTime: "18:40" }, // Muhammed Fadeel Isah
  },
  18: { // Thursday 18-06-2026
    22: { inTime: "06:50", outTime: "17:10" }, // Bashiru Dauda
    25: { inTime: "06:56", outTime: "18:11" }, // Kabiru Abdullahi
    37: { inTime: "08:15", outTime: "17:10" }, // Ayoola Joseph
    19: { inTime: "08:16" }, // Muazu M. Atim
    8:  { inTime: "08:25", outTime: "17:05" }, // Ugwu Ekechukwu
    27: { inTime: "08:25", outTime: "17:05" }, // Yusuf I
    18: { inTime: "08:28" }, // Jatau F. Anzaku
    39: { inTime: "08:28", outTime: "17:20" }, // Bm Yusuf
    57: { inTime: "08:35", outTime: "17:16" }, // Eunice Maravi Bwala
    46: { inTime: "08:36", outTime: "17:05" }, // Joseph Micheal I
    2:  { inTime: "08:39", outTime: "18:32" }, // Innocent Amaechina
    29: { inTime: "08:39", outTime: "17:25" }, // S M Mustapha
    38: { inTime: "08:40", outTime: "17:00" }, // Sangotoye A. Abogail
    11: { inTime: "08:44", outTime: "17:00" }, // Catherine Anusobi
    45: { inTime: "08:50", outTime: "17:14" }, // Ideewu Awand
    56: { inTime: "08:53", outTime: "17:20" }, // Shafin Dras
    50: { inTime: "08:55", outTime: "17:00" }, // Amina Adamu
    31: { inTime: "08:56" }, // Thomson Mbonuoser
    17: { inTime: "08:56", outTime: "17:00" }, // Isah Uman Shaba
    24: { inTime: "09:00" }, // Sampson O.T.
    4:  { inTime: "09:00", outTime: "18:10" }, // Daniel Onoja
    5:  { inTime: "09:05", outTime: "17:15" }, // Efosa Okosun
    55: { inTime: "09:05", outTime: "17:20" }, // Ayinde Folashade
    48: { inTime: "09:07" }, // Mgbi Dorothy Chisom
    15: { inTime: "09:07" }, // Jane Idaewu (Janet Idakwo)
    35: { inTime: "09:10", outTime: "17:00" }, // Baidi Aisha Gajo
    26: { inTime: "09:12" }, // Ajio Benedict
    49: { inTime: "09:13", outTime: "17:08" }, // Issa Sulaiman
    33: { inTime: "09:15" }, // Kelechi Okere
    28: { inTime: "09:15" }, // Happiness Ifeoma
    12: { inTime: "09:16", outTime: "17:35" }, // Ozichi Emelogu
    13: { inTime: "09:17" }, // Amina Kabarami
    20: { inTime: "09:17", outTime: "17:15" }, // Yusuf Adamu
    36: { inTime: "09:18" }, // Mustapha Mukhtar
    51: { inTime: "09:31", outTime: "17:00" }, // Hanna Hassan
    1:  { inTime: "10:01", outTime: "17:16" }, // Oma Obisi (Onya Ojiji)
    34: { inTime: "10:20" }, // Hassan Aliyu
    7:  { inTime: "12:20" }, // Ibrahim Saad
  },
  19: { // Friday 19-06-2026
    22: { inTime: "06:50", outTime: "17:10" }, // Bashiru Dauda
    23: { inTime: "07:00" }, // Haruna Maro Magani
    37: { inTime: "07:58", outTime: "21:00" }, // Ayoola Joseph
    19: { inTime: "08:04" }, // Muazu M. Aliyu
    27: { inTime: "08:20", outTime: "17:45" }, // Yusuf I
    21: { inTime: "08:22" }, // Sunday Chindo
    18: { inTime: "08:23" }, // Jatau F. Anzaku
    57: { inTime: "08:33", outTime: "17:10" }, // Eunice Maravi Bwala
    53: { inTime: "08:36", outTime: "17:05" }, // Agu Precious
    46: { inTime: "08:37", outTime: "17:15" }, // Joseph Micheal
    9:  { inTime: "08:40", outTime: "17:06" }, // Michael Okpewho
    8:  { inTime: "08:40", outTime: "17:05" }, // Ugwu Ekechukwu
    2:  { inTime: "08:43", outTime: "17:00" }, // Innocent Amaechina
    30: { inTime: "08:43", outTime: "17:20" }, // Ojeh Jedidah
    35: { inTime: "08:44", outTime: "17:00" }, // Baidi Aisha Gajo
    55: { inTime: "08:45", outTime: "17:00" }, // Ayinde Folashade
    24: { inTime: "08:50", outTime: "17:15" }, // Sampson O.T.
    29: { inTime: "08:56", outTime: "17:22" }, // S M Mustapha
    40: { inTime: "08:57", outTime: "17:08" }, // Uzoh Blessing
    45: { inTime: "08:57" }, // Idaewu Awand
    50: { inTime: "08:59", outTime: "17:00" }, // Amina Adamu
    12: { inTime: "08:59", outTime: "17:20" }, // Ozichi Emelogu
    4:  { inTime: "08:59", outTime: "18:40" }, // Daniel Onoja
    51: { inTime: "09:11", outTime: "17:00" }, // Haruna Hassana
    5:  { inTime: "09:20", outTime: "17:15" }, // Efosa Okosun
    36: { inTime: "09:22", outTime: "17:10" }, // Mustapha Mukhtar
    38: { inTime: "09:25", outTime: "17:20" }, // Sangotoye A. Abigail
    7:  { inTime: "09:30" }, // Ibrahim Saad
    32: { inTime: "09:30" }, // Muhammed Fadeel Isah
    13: { inTime: "09:33", outTime: "17:15" }, // Amina Kabarami
    56: { inTime: "09:30", outTime: "18:32" }, // Shafin
    17: { inTime: "09:30" }, // Isah U. Shaba
    1:  { inTime: "10:49", outTime: "17:11" }, // Osisi O. (Onya Ojiji)
    20: { inTime: "10:50" }, // Yusuf Adamu
    34: { inTime: "10:15" }, // Hassan Aliyu
  },
  20: { // Saturday 20-06-2026 (Weekend)
    58: { inTime: "08:11", outTime: "10:35" }, // Eneh Chukwudi
    5:  { inTime: "12:45", outTime: "16:15" }, // Efosa Okosun
    1:  { inTime: "12:20", outTime: "12:18" }, // Osisi Onya (Onya Ojiji)
  },
  23: { // Tuesday 23-06-2026
    22: { inTime: "06:45", outTime: "17:10" }, // Bashiru Dauda
    23: { inTime: "07:00", outTime: "17:08" }, // Haruna Maro Magani
    26: { inTime: "07:10" }, // Ajio Benedict
    25: { inTime: "07:12", outTime: "18:00" }, // Kabiru Abdullahi
    57: { inTime: "08:26", outTime: "17:20" }, // Eunice Maravi Bwala
    8:  { inTime: "08:28", outTime: "17:07" }, // Ugwu Ekechukwu
    27: { inTime: "08:29", outTime: "17:15" }, // Yusuf I
    24: { inTime: "08:33", outTime: "17:30" }, // Sampson O.T.
    35: { inTime: "08:35", outTime: "17:38" }, // Baidi Aisha Gajo
    9:  { inTime: "08:40", outTime: "17:07" }, // Michael Okpewho
    11: { inTime: "08:42" }, // Catherine Anusodi
    55: { inTime: "08:43", outTime: "17:38" }, // Ayinde Folashade
    46: { inTime: "08:45", outTime: "17:06" }, // Joseph Micheal
    6:  { inTime: "08:47" }, // Shelly Musa
    4:  { inTime: "08:48", outTime: "17:20" }, // Daniel Onoja
    2:  { inTime: "08:51", outTime: "18:53" }, // Innocent Amaechina
    29: { inTime: "08:56", outTime: "17:19" }, // S M Mustapha
    45: { inTime: "08:59", outTime: "17:40" }, // Idaewu Awend
    31: { inTime: "08:59" }, // Thomson Mbonuosa
    56: { inTime: "08:59", outTime: "17:21" }, // Shafin Osia
    49: { inTime: "08:59" }, // Issa Sulaiman
    38: { inTime: "08:59", outTime: "17:10" }, // Sangotoye A. Abigail
    40: { inTime: "09:00", outTime: "17:17" }, // Uzoh Blessing
    50: { inTime: "09:00", outTime: "17:00" }, // Amina Adamu
    13: { inTime: "09:00", outTime: "17:10" }, // Amina Kabaraini
    21: { inTime: "09:05" }, // Sunday Chindo
    54: { inTime: "09:08" }, // Agetu Vera
    17: { inTime: "09:08" }, // Isah Uman Shaba
    5:  { inTime: "09:15", outTime: "16:20" }, // Efosa Okosun
    7:  { inTime: "09:15" }, // Ibrahim Saad
    51: { inTime: "09:11", outTime: "17:11" }, // Haruna Hassan
    53: { inTime: "09:30" }, // Agu Precious
    12: { inTime: "09:50", outTime: "17:26" }, // Ozichi Emelogu
    36: { inTime: "09:50", outTime: "17:10" }, // Mustapha Mukhtar
    48: { inTime: "10:03" }, // Mgbi Dorothy Chisom
    18: { inTime: "09:52", outTime: "17:05" }, // Jatau F. Anzaku
    34: { inTime: "11:00" }, // Hassan Aliyu
    1:  { inTime: "10:01", outTime: "17:28" }, // Osisi O. (Onya Ojiji)
    20: { inTime: "12:14" }, // Yusuf Adamu
  },
  24: { // Wednesday 24-06-2026
    22: { inTime: "06:50", outTime: "17:30" }, // Bashiru Dauda
    23: { inTime: "07:00", outTime: "17:10" }, // Haruna Maro Magani
    25: { inTime: "07:01", outTime: "17:00" }, // Kabiru Abdullahi
    44: { inTime: "07:00", outTime: "17:12" }, // Opeyemi Rofiat
    43: { inTime: "08:00", outTime: "17:04" }, // Halima Mutu Rabiu
    7:  { inTime: "08:02" }, // Ibrahim Saad
    18: { inTime: "08:02", outTime: "18:31" }, // Jatau F. Anzaku
    24: { inTime: "08:10", outTime: "17:10" }, // Sampson O.T.
    55: { inTime: "08:15", outTime: "17:20" }, // Ayinde Folashade
    27: { inTime: "08:20", outTime: "17:05" }, // Musa I (Yusuf Ismail)
    29: { inTime: "08:22", outTime: "17:27" }, // S M Mustapha
    19: { inTime: "08:25" }, // Muazu M-Aliyu
    53: { inTime: "08:30", outTime: "17:03" }, // Agu Precious
    56: { inTime: "08:33", outTime: "17:45" }, // Shafin Dass (Shafiu Abbas)
    8:  { inTime: "08:35", outTime: "17:08" }, // Ugwu Ekechukwu
    12: { inTime: "08:36", outTime: "17:20" }, // Ozichi Emelogu
    49: { inTime: "08:36" }, // Issa Sulaiman
    1:  { inTime: "08:43" }, // Osisi O. (Onya Ojiji)
    9:  { inTime: "08:44", outTime: "17:13" }, // Michael Okpewho
    38: { inTime: "08:44", outTime: "17:28" }, // Sangotoye A. Abigail
    11: { inTime: "08:45", outTime: "17:00" }, // Catherine Anunobi
    48: { inTime: "08:45" }, // Mgbi Sosaty (Dorathy Mgbi)
    15: { inTime: "08:45" }, // Jane Idakwo
    28: { inTime: "08:45" }, // Happiness Ifeoma
    37: { inTime: "08:48", outTime: "17:40" }, // Ayoola Joseph
    45: { inTime: "08:48", outTime: "18:35" }, // Idaewu Awand
    34: { inTime: "08:50" }, // Hassan Aliyu
    17: { inTime: "08:50" }, // Isah Uman Shaba
    31: { inTime: "08:51" }, // Thomson Mbonuosa
    46: { inTime: "09:00", outTime: "17:05" }, // Joseph Micheal
    50: { inTime: "09:00", outTime: "17:00" }, // Amina Adamu
    5:  { inTime: "09:03", outTime: "17:20" }, // Efosa Okosun
    2:  { inTime: "09:04", outTime: "17:03" }, // Innocent Amaechina
    35: { inTime: "09:05" }, // Baidi Aisha Gajo
    4:  { inTime: "09:06", outTime: "17:10" }, // Daniel Onoja
  },
  25: { // Thursday 25-06-2026
    22: { inTime: "06:50", outTime: "17:20" }, // Bashiru Dauda
    25: { inTime: "07:00", outTime: "18:20" }, // Kabiru Abdullahi
    43: { inTime: "08:00", outTime: "17:00" }, // Halima Mutu Rabiu
    27: { inTime: "08:30", outTime: "17:20" }, // Musa I (Yusuf Ismail)
    24: { inTime: "08:35", outTime: "18:20" }, // Sampson O.T.
    6:  { inTime: "08:53", outTime: "17:15" }, // Shelly Musa
    8:  { inTime: "08:55", outTime: "17:05" }, // Ugwu Ekechukwu
    9:  { inTime: "08:58", outTime: "17:13" }, // Michael Okpewho
    15: { inTime: "08:59" }, // Jane Idalawd
    11: { inTime: "08:59" }, // Catherine Anundo
    21: { inTime: "08:59" }, // Sunday Chindo
    17: { inTime: "09:00" }, // Isah Usman Shaba
    31: { inTime: "09:00" }, // Thomson Mbonu...
    48: { inTime: "09:05" }, // Mgbi Sosaty
    37: { inTime: "09:40", outTime: "18:00" }, // Ayoola Joseph
    7:  { inTime: "09:50" }, // Ibrahim Saad
  },
  26: { // Friday 26-06-2026
    22: { inTime: "06:54", outTime: "17:12" }, // Bashiru Dauda
    43: { inTime: "07:30", outTime: "17:00" }, // Halima Mutu Rabiu
    27: { inTime: "08:20" }, // Musa I (Yusuf Ismail)
    6:  { inTime: "08:38", outTime: "17:14" }, // Shelly Amos
    23: { inTime: "08:38" }, // Haruna Maro Magani
    8:  { inTime: "08:44" }, // Ugwu Ekechukwu
    51: { inTime: "08:51", outTime: "17:00" }, // Haruna Hassan
    2:  { inTime: "08:58", outTime: "17:11" }, // Innocent Amaodina
    53: { inTime: "08:58" }, // Agu Precious
    4:  { inTime: "08:59", outTime: "17:16" }, // Daniel Dnoja
    24: { inTime: "09:00", outTime: "17:35" }, // Sampson O.T.
    57: { inTime: "09:10", outTime: "17:03" }, // Eunice Maravi Bwala
    30: { inTime: "09:10", outTime: "17:10" }, // Ojeh Jedidiah
    50: { inTime: "09:10", outTime: "17:00" }, // Amina Adamu
    40: { inTime: "09:10", outTime: "17:10" }, // Uzoh Blessing
    44: { inTime: "09:11", outTime: "17:14" }, // Opeyemi Rafun
    55: { inTime: "09:12" }, // Ayinde Folashade
    33: { inTime: "09:15", outTime: "17:38" }, // Kelechi Godan L Okoro
    35: { inTime: "09:16" }, // Baidi Aisha Gajo
    5:  { inTime: "09:13" }, // Efosa Okosun
    38: { inTime: "09:35", outTime: "17:16" }, // Sangotoye A. Abigail
    37: { inTime: "09:38", outTime: "16:30" }, // Joseph Ayoola
    19: { inTime: "09:39" }, // Muazu M-Muru
    29: { inTime: "09:49", outTime: "17:23" }, // S M Mustapha
    12: { inTime: "09:49", outTime: "17:15" }, // Ozichi Emelogu
    36: { inTime: "09:50", outTime: "17:05" }, // Mustapha Mukhtar
    46: { inTime: "09:50", outTime: "17:00" }, // Joseph Michael J
    1:  { inTime: "10:15" }, // Osisi O. (Onya Ojiji)
    20: { inTime: "10:16", outTime: "17:48" }, // Yusuf Adamu
    32: { inTime: "10:16", outTime: "18:05" }, // Muhammed Fadeel Isah
    7:  { inTime: "10:30" }, // Ibrahim Saad
    45: { inTime: "10:50", outTime: "17:40" }, // Idaewu Awand
    18: { inTime: "10:30" }, // Jatau P. Anzaku
    17: { inTime: "10:30", outTime: "17:00" }, // Isah U. Shaba
    34: { inTime: "11:00" }, // Hassan A.
    21: { inTime: "11:02" }, // Sunday Chido
  },
  27: { // Saturday 27-06-2026 (Weekend)
    4:  { inTime: "10:00", outTime: "17:33" }, // Daniel Onoja
    17: { inTime: "11:00" }, // Isah Usman Shaba
    36: { inTime: "11:10" }, // Mustapha Mukhtar
    24: { inTime: "12:20", outTime: "16:40" }, // Sampson O.T.
    19: { inTime: "13:10" }, // Muazu M-Muru
    5:  { inTime: "12:30", outTime: "16:50" }, // Efosa Okosun
  },
  29: { // Monday 29-06-2026
    23: { inTime: "07:00", outTime: "17:06" }, // Haruna Maro Magani
    20: { inTime: "07:05" }, // Yusuf Adamu
    14: { inTime: "07:53" }, // Muazu M. Miju
    43: { inTime: "08:00", outTime: "17:00" }, // Halima Mutu Rabiu
    46: { inTime: "08:02", outTime: "17:30" }, // Joseph Micheal J.
    37: { inTime: "08:02", outTime: "17:00" }, // Ayoola Joseph
    26: { inTime: "08:38" }, // Ajio Benedict
    9:  { inTime: "08:39", outTime: "17:17" }, // Michael Okpoush
    53: { inTime: "08:40", outTime: "17:05" }, // Agu Precious
    27: { inTime: "08:45", outTime: "17:10" }, // Yusuf I (Yusuf Ismail)
    35: { inTime: "08:45", outTime: "18:03" }, // Baidi Aisha Gajo
    11: { inTime: "08:46" }, // Catherine Anundi
    50: { inTime: "08:47", outTime: "17:00" }, // Amina Adamu
    18: { inTime: "08:48", outTime: "17:16" }, // Jatau F. Anzaku
    49: { inTime: "08:48" }, // Issa Sulaiman
    30: { inTime: "08:48", outTime: "17:15" }, // Ojeh Jedidiah
    2:  { inTime: "08:50", outTime: "18:02" }, // Innocent Amaechina
    24: { inTime: "09:00", outTime: "17:16" }, // Sampson O.T.
    4:  { inTime: "09:00", outTime: "17:11" }, // Daniel Onoja
    31: { inTime: "09:01" }, // Thomson Mbonuosa
    51: { inTime: "09:01", outTime: "17:00" }, // Haruna Hassan
    5:  { inTime: "09:04", outTime: "17:15" }, // Efosa Okosun
    45: { inTime: "09:02", outTime: "17:00" }, // Idaewu Awand
    6:  { inTime: "09:05", outTime: "17:21" }, // Shelly Musa
    21: { inTime: "09:06" }, // Sunday Chido
    40: { inTime: "09:07", outTime: "17:38" }, // Uzoh Blessing
    33: { inTime: "09:07" }, // Kelechi Okoro
    36: { inTime: "09:11" }, // Mustapha Mukhtar
    15: { inTime: "09:11" }, // Jane Idam
    44: { inTime: "09:11", outTime: "17:56" }, // Opeyemi Rafiat
    32: { inTime: "09:11" }, // Muhammed Fadeel Isah
    34: { inTime: "09:12" }, // Hassan Aliyu
    13: { inTime: "09:15" }, // Amina Kabardi
    55: { inTime: "09:20", outTime: "17:30" }, // Ayinde Folashade
    38: { inTime: "09:20", outTime: "17:15" }, // Sangotoye A. Abigail
    28: { inTime: "09:20" }, // Happiness Ifeoma
    17: { inTime: "09:20" }, // Isah Usman Shaba
    12: { inTime: "09:26", outTime: "17:36" }, // Ozichi Emelogu
    1:  { inTime: "10:38" }, // Osisi O.
  },
  30: { // Tuesday 30-06-2026
    22: { inTime: "06:54", outTime: "17:12" }, // Bashiru Dayda
    23: { inTime: "07:00", outTime: "17:21" }, // Haruna Maro Magani
    57: { inTime: "07:59", outTime: "17:20" }, // Eunice Maravi Bwala
    43: { inTime: "08:00", outTime: "17:05" }, // Halima Mutu Rabiu
    29: { inTime: "08:15", outTime: "17:14" }, // S M Mustapha
    14: { inTime: "08:18" }, // Muazu M. Ahiju (Nansah Abashe)
    24: { inTime: "08:27", outTime: "17:30" }, // Sampson O.T.
    9:  { inTime: "08:28" }, // Michael Okpounh
    27: { inTime: "08:30", outTime: "17:07" }, // Musa I (Yusuf Ismail)
    8:  { inTime: "08:35", outTime: "17:05" }, // Ugwu Ekechukwu
    21: { inTime: "08:37" }, // Sunday Chido
    6:  { inTime: "08:41", outTime: "17:13" }, // Shelly Musa
    55: { inTime: "08:45", outTime: "17:15" }, // Ayinde Folashade
    33: { inTime: "08:48" }, // Kelechi Okerie
    4:  { inTime: "08:48", outTime: "17:10" }, // Daniel Onoja
    53: { inTime: "08:50", outTime: "17:00" }, // Agu Precious
    45: { inTime: "08:52" }, // Idaewu Awand
    11: { inTime: "08:52" }, // Catherine Anundi
    2:  { inTime: "08:58", outTime: "17:22" }, // Innocent Amaechina
    26: { inTime: "08:58" }, // Ajio Benedict
    38: { inTime: "08:59", outTime: "17:11" }, // Sangotoye A. Abigail
    18: { inTime: "08:59", outTime: "17:13" }, // Jatau F. Anzaku
    48: { inTime: "09:02", outTime: "17:10" }, // Mgbi Bosse Chisom
    49: { inTime: "09:04", outTime: "17:06" }, // Issa Sulaiman
    35: { inTime: "09:10", outTime: "17:07" }, // Baidi Aisha Gajo
    56: { inTime: "09:11", outTime: "17:31" }, // Shafan (Shafiu Abbas)
    5:  { inTime: "09:12", outTime: "17:26" }, // Efosa Okosun (written as 9:02 but after line)
    13: { inTime: "09:14", outTime: "17:12" }, // Amna Kodarani
    40: { inTime: "09:14", outTime: "17:10" }, // Uzoh Blessing
    7:  { inTime: "07:30" }, // Ibrahim Saod (7:??)
    50: { inTime: "09:20", outTime: "17:05" }, // Amina Adamu
    1:  { inTime: "09:20" }, // Osisi O.
    36: { inTime: "09:21", outTime: "17:10" }, // Mustapha Mukhtar
    12: { inTime: "09:22", outTime: "18:09" }, // Ozichi Emelogu
    31: { inTime: "09:30" }, // Thomson Msaurden
    51: { inTime: "09:30", outTime: "17:31" }, // Haruna Hassan
    32: { inTime: "09:30", outTime: "17:30" }, // Muhamed Fadeel (Muhammed Fadel Isah)
    30: { inTime: "09:30" }, // Ojeh Jedidiah
    34: { inTime: "09:40" }, // Hassan Aliyu
    28: { inTime: "09:40" }, // Happiness Ifeoma
    17: { inTime: "09:25" }, // Isah Usman Shabas
    20: { inTime: "12:37" }, // Yusuf Adamu
  }
};

// Helper to uniquely identify the ISO week of a date
export function getISOWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export interface WorkdayPeriodDay {
  date: Date;
  dayNum: number;
  monthLabel: string;
  isWorkday: boolean;
}

// Generates correct stats for June 2026 based on the actual raw logs above with "one day off" rule applied
export const getJuneStaffAttendance = (
  activeWorkdays: WorkdayPeriodDay[],
  isStaffOnLeave: (staffName: string, date: Date) => boolean
): MayStaffAttendance[] => {
  // Let's copy all 56 staff from May to keep office names, etc.
  const baseStaffList = [...may2026StaffAttendance];
  
  // Extend with SN 57 and 58 if not present
  if (!baseStaffList.some(s => s.sn === 57)) {
    baseStaffList.push({
      sn: 57,
      name: "EUNICE MARAVI BWALA",
      office: "REGISTRY",
      attendanceRate: 100,
      punctualRate: 100,
      cummPerformance: 100,
      daysPresent: 0,
      daysPunctual: 0
    });
  }
  if (!baseStaffList.some(s => s.sn === 58)) {
    baseStaffList.push({
      sn: 58,
      name: "ENEH CHUKWUDI",
      office: "IT UNIT",
      attendanceRate: 100,
      punctualRate: 100,
      cummPerformance: 100,
      daysPresent: 0,
      daysPunctual: 0
    });
  }
  if (!baseStaffList.some(s => s.sn === 59)) {
    baseStaffList.push({
      sn: 59,
      name: "JAMES MUSA",
      office: "DRIVER",
      attendanceRate: 100,
      punctualRate: 100,
      cummPerformance: 100,
      daysPresent: 0,
      daysPunctual: 0
    });
  }
  if (!baseStaffList.some(s => s.sn === 60)) {
    baseStaffList.push({
      sn: 60,
      name: "AZIBADINYAR TOBINS",
      office: "ADMIN/HR",
      attendanceRate: 100,
      punctualRate: 100,
      cummPerformance: 100,
      daysPresent: 0,
      daysPunctual: 0
    });
  }
  if (!baseStaffList.some(s => s.sn === 61)) {
    baseStaffList.push({
      sn: 61,
      name: "UKONU IKECHUKWU M",
      office: "CSIT",
      attendanceRate: 100,
      punctualRate: 100,
      cummPerformance: 100,
      daysPresent: 0,
      daysPunctual: 0
    });
  }

  // Group active workdays by ISO week string
  const weeksMap: Record<string, WorkdayPeriodDay[]> = {};
  activeWorkdays.forEach(wd => {
    const weekId = getISOWeekString(wd.date);
    if (!weeksMap[weekId]) {
      weeksMap[weekId] = [];
    }
    weeksMap[weekId].push(wd);
  });

  // Calculate days present & punctual for each staff based on daily logs and "one day off" rule
  return baseStaffList.map(s => {
    let daysPresent = 0;
    let daysPunctual = 0;
    const wfhDaysSet = new Set<string>(); // "monthLabel-dayNum"

    // Find first absence in each week and mark as WFH
    Object.keys(weeksMap).forEach(weekId => {
      const weekDays = weeksMap[weekId];
      let firstAbsenceDay: WorkdayPeriodDay | null = null;

      weekDays.forEach(wd => {
        const dayLogs = wd.monthLabel === 'Jul' ? july2026DailyLogs[wd.dayNum] : june2026DailyLogs[wd.dayNum];
        // If we don't have logs at all for that day, we don't count it as an absence or a presence (we skip it)
        if (!dayLogs) {
          return;
        }

        const hasLog = dayLogs[s.sn] !== undefined;
        const onLeave = isStaffOnLeave(s.name, wd.date);

        if (!hasLog && !onLeave) {
          if (!firstAbsenceDay) {
            firstAbsenceDay = wd;
          }
        }
      });

      if (firstAbsenceDay) {
        const dateKey = `${(firstAbsenceDay as WorkdayPeriodDay).monthLabel}-${(firstAbsenceDay as WorkdayPeriodDay).dayNum}`;
        wfhDaysSet.add(dateKey);
      }
    });

    // Calculate days present and punctual factoring in logs, leaves, and WFH days
    activeWorkdays.forEach(wd => {
      const dayLogs = wd.monthLabel === 'Jul' ? july2026DailyLogs[wd.dayNum] : june2026DailyLogs[wd.dayNum];
      
      // If we don't have logs for this workday at all, we don't penalize anyone (count as present & punctual)
      if (!dayLogs) {
        daysPresent++;
        daysPunctual++;
        return;
      }

      const log = dayLogs[s.sn];
      const onLeave = isStaffOnLeave(s.name, wd.date);
      const dateKey = `${wd.monthLabel}-${wd.dayNum}`;
      const isWFH = wfhDaysSet.has(dateKey);

      if (log) {
        daysPresent++;
        if (log.inTime <= "09:10") {
          daysPunctual++;
        }
      } else if (onLeave) {
        // Excused days are subtracted from the denominator in stats, so we do not increment present/punctual here.
      } else if (isWFH) {
        // Work From Home counts as present and punctual!
        daysPresent++;
        daysPunctual++;
      }
    });

    return {
      ...s,
      daysPresent,
      daysPunctual,
      wfhDays: Array.from(wfhDaysSet),
      attendanceRate: null, // calculated in UI view
      punctualRate: null,
      cummPerformance: null
    };
  });
};

export const july2026DailyLogs: Record<number, Record<number, JuneLogEntry>> = {
  1: {
    22: { inTime: "06:40", outTime: "17:20" },
    25: { inTime: "06:55", outTime: "17:21" },
    59: { inTime: "07:25", outTime: "17:08" },
    44: { inTime: "07:25", outTime: "17:00" },
    23: { inTime: "07:30" },
    18: { inTime: "07:41" },
    19: { inTime: "08:26" },
    27: { inTime: "08:30", outTime: "17:10" },
    53: { inTime: "08:35" },
    57: { inTime: "08:40", outTime: "17:08" },
    11: { inTime: "08:46", outTime: "17:00" },
    61: { inTime: "08:50", outTime: "17:05" },
    60: { inTime: "08:52", outTime: "17:05" },
    26: { inTime: "08:52" },
    37: { inTime: "08:52", outTime: "17:31" },
    29: { inTime: "08:53", outTime: "17:19" },
    8: { inTime: "08:58", outTime: "17:02" },
    46: { inTime: "09:00", outTime: "17:05" },
    55: { inTime: "09:00", outTime: "17:30" },
    17: { inTime: "09:01" },
    56: { inTime: "09:01", outTime: "17:34" },
    4: { inTime: "09:02", outTime: "17:30" },
    2: { inTime: "09:05", outTime: "18:34" },
    49: { inTime: "09:05", outTime: "17:08" },
    6: { inTime: "09:05", outTime: "17:59" },
    51: { inTime: "09:05", outTime: "17:00" },
    9: { inTime: "09:06", outTime: "17:20" },
    5: { inTime: "09:10", outTime: "17:20" },
    34: { inTime: "09:18" },
    36: { inTime: "09:16" },
    40: { inTime: "09:16", outTime: "17:08" },
    30: { inTime: "09:17" },
    28: { inTime: "09:17" },
    31: { inTime: "09:18" },
    12: { inTime: "09:18", outTime: "18:05" },
    7: { inTime: "09:20" },
    33: { inTime: "09:20" },
    15: { inTime: "09:25" },
    38: { inTime: "09:25", outTime: "17:04" },
    48: { inTime: "09:27", outTime: "17:12" },
    32: { inTime: "09:27" }
  },
  2: {
    22: { inTime: "06:50", outTime: "17:01" },
    26: { inTime: "07:00" },
    25: { inTime: "07:16", outTime: "18:21" },
    43: { inTime: "07:20", outTime: "17:02" },
    59: { inTime: "07:35", outTime: "17:04" },
    18: { inTime: "07:44" },
    19: { inTime: "08:24" },
    29: { inTime: "08:25", outTime: "17:29" },
    57: { inTime: "08:35", outTime: "17:01" },
    27: { inTime: "08:35", outTime: "17:10" },
    44: { inTime: "08:38", outTime: "17:00" },
    60: { inTime: "08:38", outTime: "17:00" },
    61: { inTime: "08:40", outTime: "17:00" },
    55: { inTime: "08:40", outTime: "17:29" },
    35: { inTime: "08:45", outTime: "17:29" },
    9: { inTime: "08:49", outTime: "17:18" },
    49: { inTime: "08:50" },
    46: { inTime: "08:51", outTime: "17:10" },
    8: { inTime: "08:51", outTime: "17:04" },
    33: { inTime: "08:56", outTime: "17:08" },
    4: { inTime: "08:58", outTime: "17:40" },
    5: { inTime: "09:01", outTime: "17:13" },
    38: { inTime: "09:01", outTime: "17:01" },
    56: { inTime: "09:02" },
    21: { inTime: "09:04" },
    17: { inTime: "09:04", outTime: "17:00" },
    48: { inTime: "09:06", outTime: "17:01" },
    11: { inTime: "09:07", outTime: "17:00" },
    50: { inTime: "09:10", outTime: "17:00" },
    37: { inTime: "09:10", outTime: "17:00" },
    31: { inTime: "09:11" },
    15: { inTime: "09:11" },
    28: { inTime: "09:11" },
    36: { inTime: "09:12", outTime: "17:05" },
    45: { inTime: "09:15" },
    13: { inTime: "09:15", outTime: "17:06" },
    6: { inTime: "09:20", outTime: "17:24" },
    34: { inTime: "09:20" },
    2: { inTime: "11:25", outTime: "17:56" },
    7: { inTime: "11:48" }
  },
  3: {
    22: { inTime: "06:55", outTime: "17:10" },
    43: { inTime: "07:50", outTime: "17:03" },
    59: { inTime: "07:55", outTime: "17:02" },
    23: { inTime: "07:50" },
    8: { inTime: "08:29", outTime: "17:04" },
    2: { inTime: "08:28", outTime: "20:11" },
    27: { inTime: "08:38", outTime: "17:05" },
    4: { inTime: "08:35", outTime: "17:28" },
    44: { inTime: "08:35" },
    60: { inTime: "08:38", outTime: "14:51" },
    61: { inTime: "08:40", outTime: "17:09" },
    19: { inTime: "08:42" },
    55: { inTime: "08:42", outTime: "17:05" },
    57: { inTime: "08:45", outTime: "17:26" },
    29: { inTime: "08:50", outTime: "17:34" },
    6: { inTime: "08:53" },
    50: { inTime: "08:54", outTime: "17:10" },
    53: { inTime: "08:56" },
    37: { inTime: "08:57", outTime: "17:20" },
    30: { inTime: "08:58" },
    32: { inTime: "08:58" },
    51: { inTime: "09:01", outTime: "17:14" },
    18: { inTime: "09:04" },
    45: { inTime: "09:05" },
    5: { inTime: "11:00" },
    40: { inTime: "09:11", outTime: "17:00" },
    36: { inTime: "09:12" },
    46: { inTime: "09:13", outTime: "17:05" },
    38: { inTime: "09:13" },
    56: { inTime: "09:14", outTime: "10:21" },
    15: { inTime: "09:16" },
    7: { inTime: "09:20" },
    13: { inTime: "09:20" },
    21: { inTime: "09:22" },
    12: { inTime: "09:23", outTime: "17:15" },
    17: { inTime: "09:22" },
    34: { inTime: "09:30" }
  },
  4: {
    19: { inTime: "10:23", outTime: "17:10" },
    17: { inTime: "10:25", outTime: "16:10" },
    56: { inTime: "10:28", outTime: "20:14" }
  },
  5: {
    56: { inTime: "09:18", outTime: "16:00" },
    17: { inTime: "11:00", outTime: "16:30" }
  },
  6: {
    25: { inTime: "06:23", outTime: "17:00" },
    34: { inTime: "06:30" },
    46: { inTime: "07:38" },
    50: { inTime: "07:40", outTime: "17:00" },
    43: { inTime: "07:41", outTime: "17:00" },
    59: { inTime: "07:53" },
    37: { inTime: "07:59", outTime: "18:00" },
    30: { inTime: "07:55" },
    19: { inTime: "08:16" },
    39: { inTime: "08:20", outTime: "17:05" },
    60: { inTime: "08:20", outTime: "17:00" },
    23: { inTime: "08:21", outTime: "17:11" },
    18: { inTime: "08:24", outTime: "17:00" },
    6: { inTime: "08:34", outTime: "17:30" },
    24: { inTime: "08:35", outTime: "17:18" },
    61: { inTime: "08:45", outTime: "17:00" },
    44: { inTime: "08:25" },
    26: { inTime: "08:40" },
    2: { inTime: "08:49", outTime: "19:19" },
    35: { inTime: "08:49", outTime: "17:11" },
    33: { inTime: "08:50" },
    10: { inTime: "08:51" },
    56: { inTime: "08:58", outTime: "19:40" },
    31: { inTime: "08:59" },
    11: { inTime: "08:59", outTime: "17:00" },
    17: { inTime: "09:06", outTime: "17:00" },
    5: { inTime: "09:04", outTime: "17:20" },
    32: { inTime: "09:05", outTime: "17:20" },
    53: { inTime: "09:13", outTime: "17:00" },
    4: { inTime: "09:14", outTime: "17:14" },
    45: { inTime: "09:11", outTime: "18:50" },
    55: { inTime: "09:12", outTime: "17:15" },
    49: { inTime: "09:14", outTime: "17:02" },
    40: { inTime: "09:12", outTime: "17:00" },
    21: { inTime: "09:06" },
    9: { inTime: "09:24", outTime: "17:11" },
    13: { inTime: "09:30", outTime: "17:07" },
    36: { inTime: "09:31", outTime: "17:02" },
    51: { inTime: "09:31", outTime: "17:09" },
    15: { inTime: "09:32" },
    12: { inTime: "09:33", outTime: "17:45" },
    48: { inTime: "09:35" },
    7: { inTime: "09:36" }
  },
  7: {
    22: { inTime: "06:52", outTime: "17:02" },
    25: { inTime: "06:58" },
    46: { inTime: "07:32", outTime: "17:01" },
    23: { inTime: "07:41" },
    59: { inTime: "07:55", outTime: "17:00" },
    26: { inTime: "07:54" },
    39: { inTime: "08:15", outTime: "17:20" },
    19: { inTime: "08:23" },
    9: { inTime: "08:30" },
    43: { inTime: "08:30", outTime: "17:28" },
    57: { inTime: "08:32", outTime: "17:15" },
    24: { inTime: "08:37", outTime: "17:50" },
    60: { inTime: "08:40", outTime: "17:01" },
    53: { inTime: "08:45", outTime: "17:20" },
    31: { inTime: "08:46", outTime: "17:00" },
    61: { inTime: "08:49" },
    8: { inTime: "08:49" },
    55: { inTime: "08:50", outTime: "17:00" },
    4: { inTime: "08:50", outTime: "17:35" },
    29: { inTime: "08:50", outTime: "17:35" },
    45: { inTime: "08:51", outTime: "18:10" },
    50: { inTime: "08:59", outTime: "17:00" },
    21: { inTime: "08:59" },
    33: { inTime: "08:59", outTime: "17:34" },
    10: { inTime: "09:00" },
    49: { inTime: "09:02", outTime: "17:03" },
    17: { inTime: "09:06", outTime: "17:00" },
    56: { inTime: "09:06" },
    30: { inTime: "09:06" },
    32: { inTime: "09:06", outTime: "17:40" },
    11: { inTime: "09:10", outTime: "17:10" },
    48: { inTime: "09:12", outTime: "17:02" },
    40: { inTime: "09:12", outTime: "17:05" },
    5: { inTime: "09:16", outTime: "17:17" },
    38: { inTime: "09:16", outTime: "17:21" },
    2: { inTime: "09:20", outTime: "18:31" },
    35: { inTime: "09:20", outTime: "17:55" },
    18: { inTime: "09:24" },
    12: { inTime: "09:26", outTime: "18:20" },
    15: { inTime: "09:27" },
    36: { inTime: "09:28", outTime: "17:21" },
    7: { inTime: "09:29" },
    34: { inTime: "09:40" },
    13: { inTime: "09:40", outTime: "17:20" },
    6: { inTime: "10:10" },
    51: { inTime: "09:10", outTime: "17:05" }
  },
  8: {
    22: { inTime: "06:55", outTime: "17:10" },
    25: { inTime: "06:56", outTime: "18:11" },
    26: { inTime: "06:57" },
    29: { inTime: "07:38", outTime: "18:21" },
    46: { inTime: "07:40", outTime: "17:50" },
    43: { inTime: "07:41", outTime: "17:02" },
    23: { inTime: "07:50" },
    37: { inTime: "07:58", outTime: "18:30" },
    59: { inTime: "07:58", outTime: "17:06" },
    8: { inTime: "08:10" },
    57: { inTime: "08:19", outTime: "17:15" },
    24: { inTime: "08:22", outTime: "17:50" },
    18: { inTime: "08:26" },
    32: { inTime: "08:28" },
    30: { inTime: "08:35" },
    53: { inTime: "08:40", outTime: "17:00" },
    44: { inTime: "08:41", outTime: "17:00" },
    11: { inTime: "08:47", outTime: "17:00" },
    4: { inTime: "08:46", outTime: "17:41" },
    19: { inTime: "08:51" },
    60: { inTime: "08:54", outTime: "17:00" },
    49: { inTime: "08:52" },
    61: { inTime: "08:55", outTime: "17:00" },
    10: { inTime: "08:58" },
    56: { inTime: "08:58" },
    38: { inTime: "08:59", outTime: "17:05" },
    9: { inTime: "08:59", outTime: "17:00" },
    40: { inTime: "09:00", outTime: "17:07" },
    17: { inTime: "09:06", outTime: "17:00" },
    2: { inTime: "09:07", outTime: "18:18" },
    51: { inTime: "09:11", outTime: "17:05" },
    39: { inTime: "09:15" },
    5: { inTime: "09:20", outTime: "17:20" },
    36: { inTime: "09:20", outTime: "17:03" },
    48: { inTime: "09:31", outTime: "17:05" },
    31: { inTime: "09:32" },
    6: { inTime: "09:35", outTime: "17:00" },
    34: { inTime: "09:40", outTime: "17:00" },
    12: { inTime: "09:40" },
    55: { inTime: "12:00" }
  },
  9: {
    22: { inTime: "06:50", outTime: "17:00" },
    25: { inTime: "06:55", outTime: "18:14" },
    59: { inTime: "08:07", outTime: "17:15" },
    24: { inTime: "08:37", outTime: "17:37" },
    9: { inTime: "08:38" },
    43: { inTime: "08:39" },
    18: { inTime: "08:41" },
    60: { inTime: "08:41", outTime: "17:10" },
    35: { inTime: "08:50", outTime: "17:31" },
    8: { inTime: "08:51", outTime: "17:05" },
    2: { inTime: "09:00", outTime: "20:07" },
    4: { inTime: "09:02", outTime: "18:02" },
    46: { inTime: "09:03" },
    37: { inTime: "09:03" },
    10: { inTime: "09:04" },
    29: { inTime: "09:05", outTime: "17:44" },
    36: { inTime: "09:07", outTime: "17:05" },
    44: { inTime: "09:08", outTime: "17:31" },
    6: { inTime: "09:30", outTime: "17:32" },
    55: { inTime: "09:30", outTime: "18:30" },
    31: { inTime: "09:10" },
    50: { inTime: "09:40", outTime: "17:00" },
    15: { inTime: "09:41" },
    57: { inTime: "09:55", outTime: "17:16" },
    39: { inTime: "09:58" },
    38: { inTime: "09:58", outTime: "17:05" },
    45: { inTime: "09:59", outTime: "19:00" },
    19: { inTime: "09:59" },
    48: { inTime: "10:10", outTime: "17:00" },
    49: { inTime: "10:02", outTime: "19:00" },
    32: { inTime: "10:00", outTime: "18:10" },
    13: { inTime: "10:10", outTime: "17:07" },
    21: { inTime: "10:02" },
    11: { inTime: "10:02", outTime: "17:00" },
    17: { inTime: "10:05" },
    12: { inTime: "10:05", outTime: "18:05" },
    56: { inTime: "10:07", outTime: "17:05" },
    34: { inTime: "10:08" },
    5: { inTime: "09:21", outTime: "17:15" },
    61: { inTime: "09:21", outTime: "17:00" }
  },
  10: {
    22: { inTime: "06:55", outTime: "17:00" },
    23: { inTime: "07:00", outTime: "18:34" },
    43: { inTime: "07:47", outTime: "17:02" },
    59: { inTime: "07:52", outTime: "17:06" },
    19: { inTime: "08:12" },
    60: { inTime: "08:15", outTime: "17:00" },
    44: { inTime: "08:16", outTime: "17:00" },
    45: { inTime: "08:18", outTime: "18:25" },
    53: { inTime: "08:45" },
    46: { inTime: "08:46", outTime: "17:15" },
    29: { inTime: "08:47", outTime: "18:26" },
    30: { inTime: "08:47" },
    6: { inTime: "08:45", outTime: "17:10" },
    55: { inTime: "08:47", outTime: "17:00" },
    36: { inTime: "08:50", outTime: "17:00" },
    4: { inTime: "08:54", outTime: "17:20" },
    35: { inTime: "08:55" },
    37: { inTime: "08:57", outTime: "17:30" },
    2: { inTime: "08:58", outTime: "18:04" },
    24: { inTime: "09:00", outTime: "17:10" },
    57: { inTime: "09:02", outTime: "17:10" },
    18: { inTime: "09:02", outTime: "18:20" },
    40: { inTime: "09:03", outTime: "17:00" },
    39: { inTime: "09:05", outTime: "17:20" },
    33: { inTime: "09:06", outTime: "17:00" },
    5: { inTime: "09:15", outTime: "17:10" },
    8: { inTime: "09:20" },
    26: { inTime: "09:20" },
    50: { inTime: "09:30", outTime: "17:10" },
    51: { inTime: "09:31", outTime: "17:00" },
    13: { inTime: "09:30", outTime: "17:01" },
    12: { inTime: "09:30" },
    15: { inTime: "09:31" },
    21: { inTime: "09:33" },
    7: { inTime: "09:50" },
    17: { inTime: "09:50", outTime: "17:00" },
    34: { inTime: "10:30" },
    9: { inTime: "12:25", outTime: "17:48" }
  },
  11: {
    22: { inTime: "07:00", outTime: "17:00" },
    58: { inTime: "07:40" },
    23: { inTime: "08:50", outTime: "15:00" },
    4: { inTime: "09:00", outTime: "14:44" },
    29: { inTime: "10:00", outTime: "13:25" },
    19: { inTime: "11:48", outTime: "18:30" },
    5: { inTime: "11:50" },
    18: { inTime: "11:58", outTime: "16:24" },
    24: { inTime: "12:10", outTime: "15:40" },
    17: { inTime: "12:15", outTime: "17:30" },
    55: { inTime: "13:00" }
  },
  12: {
    17: { inTime: "10:00", outTime: "17:00" },
    19: { inTime: "10:20" }
  },
  13: {
    25: { inTime: "06:21", outTime: "18:00" },
    46: { inTime: "07:35", outTime: "17:19" },
    59: { inTime: "07:45", outTime: "17:01" },
    9: { inTime: "08:13", outTime: "17:02" },
    37: { inTime: "08:25", outTime: "17:20" },
    60: { inTime: "08:26", outTime: "17:00" },
    55: { inTime: "08:30", outTime: "20:00" },
    23: { inTime: "08:31", outTime: "17:01" },
    35: { inTime: "08:33", outTime: "17:00" },
    27: { inTime: "08:35", outTime: "17:00" },
    53: { inTime: "08:46", outTime: "17:00" },
    4: { inTime: "08:48", outTime: "17:28" },
    43: { inTime: "08:50", outTime: "17:18" },
    24: { inTime: "08:53", outTime: "17:20" },
    56: { inTime: "08:55" },
    19: { inTime: "08:56" },
    44: { inTime: "08:57", outTime: "17:00" },
    31: { inTime: "08:58" },
    61: { inTime: "08:59", outTime: "17:00" },
    39: { inTime: "09:08", outTime: "19:00" },
    2: { inTime: "09:05", outTime: "18:48" },
    16: { inTime: "09:05" },
    48: { inTime: "09:10" },
    50: { inTime: "09:10", outTime: "17:00" },
    10: { inTime: "09:10" },
    49: { inTime: "09:10", outTime: "17:09" },
    40: { inTime: "09:10", outTime: "17:53" },
    5: { inTime: "09:10", outTime: "17:20" },
    11: { inTime: "09:10", outTime: "17:00" },
    21: { inTime: "09:14" },
    30: { inTime: "09:15" },
    33: { inTime: "09:16" },
    18: { inTime: "09:22", outTime: "17:17" },
    26: { inTime: "09:29" },
    15: { inTime: "09:30" },
    51: { inTime: "09:30", outTime: "17:00" },
    36: { inTime: "09:31", outTime: "17:10" },
    6: { inTime: "09:32", outTime: "17:40" },
    17: { inTime: "09:36", outTime: "20:00" },
    34: { inTime: "09:33" },
    13: { inTime: "09:36", outTime: "17:10" },
    12: { inTime: "09:37", outTime: "17:10" }
  }
};
