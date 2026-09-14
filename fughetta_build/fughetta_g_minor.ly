\version "2.24.3"

\header {
  title = "Fughetta in G minor"
  subtitle = "for Violin, Viola and Violoncello"
  composer = "OpenAI"
  tagline = ##f
}

violinMusic = {
  \key g \minor
  \time 3/4
  \clef treble
  \tempo "Moderato, con moto" 4 = 84
  r2. | % m. 1
  r2. | % m. 2
  d'2 g4 | % m. 3
  a2 fis''4 | % m. 4
  bes''4 a''8 g''8 fis''4 | % m. 5
  g''4 fis''4 d'''4 | % m. 6
  \barNumberCheck #7  % Episode I
  g''2 d''4 | % m. 7
  ees''4 d''4 c''4 | % m. 8
  fis''2 g''4 | % m. 9
  g''4 f''4 d''4 | % m. 10
  c''4 d''8 ees''8 f''4 | % m. 11
  c''4 a'4 bes'4 | % m. 12
  \barNumberCheck #13  % Counterexposition
  bes''2 f''4 | % m. 13
  g''2 d''''4 | % m. 14
  f''2 c''4 | % m. 15
  d''2 a'''4 | % m. 16
  d''4 c''8 bes'8 a'4 | % m. 17
  bes'4 a'4 f''4 | % m. 18
  a'''2 fis'''8 cis'''8 | % m. 19
  fis'''4 e'''4 cis'''4 | % m. 20
  bes''4 a''8 g''8 fis''4 | % m. 21
  g''4 fis''4 d'''4 | % m. 22
  f''2 d''8 a'8 | % m. 23
  d'4 c'4 f'4 | % m. 24
  \barNumberCheck #25  % Episode II
  bes'4 a'8 g'8 f'4 | % m. 25
  c''4 d''4 d''4 | % m. 26
  f''4 g''4 e''4 | % m. 27
  g''2 a''4 | % m. 28
  bes''2 g''4 | % m. 29
  d''2 c''4 | % m. 30
  \barNumberCheck #31  % Development I
  g''4 d''8 e''4 b'''8 | % m. 31
  bes''4 f''8 g''4 d''''8 | % m. 32
  g''2 d'''4 | % m. 33
  c'''4 bes''4 a''4 | % m. 34
  d''''4 g''2 | % m. 35
  f''4 bes''2 | % m. 36
  ees''4 d''8 c''8 b'4 | % m. 37
  cis''2 d''4 | % m. 38
  a'2 e'4 | % m. 39
  bes'2 f'4 | % m. 40
  cis''4 d''4 e''4 | % m. 41
  fis''2. | % m. 42
  \barNumberCheck #43  % Episode III
  g''4 f''4 g''4 | % m. 43
  aes''2 ees''4 | % m. 44
  a''2 cis''4 | % m. 45
  g''2 fis''4 | % m. 46
  a''2. | % m. 47
  e''2 fis''4 | % m. 48
  \barNumberCheck #49  % Stretto / Canon
  d''2 c''4 | % m. 49
  d''2 a'4 | % m. 50
  b'2 fis'''4 | % m. 51
  a''4 g''4 fis''4 | % m. 52
  r2 d'''4~ | % m. 53
  d'''4 a'''4 g'''4~ | % m. 54
  g'''4 cis''4 d''4 | % m. 55
  g''4 d''8 e''4 b'''8 | % m. 56
  c'''2 bes''4 | % m. 57
  d''2 a'4 | % m. 58
  c'''4 a''4 fis''4 | % m. 59
  c'''4 bes''4 a''4 | % m. 60
  \barNumberCheck #61  % Episode IV
  a''2 fis''4 | % m. 61
  g''2. | % m. 62
  g''2 ees''4 | % m. 63
  ees''2 c''4 | % m. 64
  g''2 e''4 | % m. 65
  fis''2 a''4 | % m. 66
  \barNumberCheck #67  % Synthetic Development
  g''2 f''4 | % m. 67
  ees''4 d''4 c''4 | % m. 68
  bes''4 a''8 g''8 fis''4 | % m. 69
  g''4 fis''4 d'''4 | % m. 70
  bes''4 a''8 g''8 fis''4 | % m. 71
  g''4 fis''4 d'''4 | % m. 72
  d'''2 b''8 fis''8 | % m. 73
  b''4 a''4 fis''4 | % m. 74
  bes''4 a''8 g''8 fis''4 | % m. 75
  g''4 fis''4 d'''4 | % m. 76
  a''2 fis''8 cis''8 | % m. 77
  fis''4 e''4 a''4 | % m. 78
  \barNumberCheck #79  % Dominant Accumulation
  g''2 d''4 | % m. 79
  fis''4 g''8 a''8 bes''4 | % m. 80
  d'''2 a'''4 | % m. 81
  g'''2 cis''4 | % m. 82
  g''4 d''8 e''4 b'''8 | % m. 83
  ees''2 bes'4 | % m. 84
  cis''4 d''4 e''4 | % m. 85
  fis''2 a''4 | % m. 86
  g''2 d''4 | % m. 87
  ees'''4 d'''4 c'''4 | % m. 88
  c'''4 bes''8 a''8 fis''4 | % m. 89
  a''4 g''4 fis''4 | % m. 90
  \barNumberCheck #91  % Final Subject
  bes''4 a''8 g''8 fis''4 | % m. 91
  g''4 fis''4 d'''4 | % m. 92
  \barNumberCheck #93  % Coda
  g''2 d''4 | % m. 93
  ees'''4 d'''4 c'''4 | % m. 94
  d'''4 c'''4 bes''4 | % m. 95
  c'''2 bes''4 | % m. 96
  bes''4 a''4 bes''4 | % m. 97
  a''2 fis''4 | % m. 98
  bes'2. | % m. 99
}

violaMusic = {
  \key g \minor
  \time 3/4
  \clef alto
  g2 d4 | % m. 1
  e2 b'4 | % m. 2
  bes4 a8 g8 fis4 | % m. 3
  g4 fis4 d'4 | % m. 4
  d''2 b'8 fis'8 | % m. 5
  b'4 a'4 fis'4 | % m. 6
  \barNumberCheck #7  % Episode I
  bes2 c'4 | % m. 7
  g'4 f'4 ees'4 | % m. 8
  a'2 e'4 | % m. 9
  d'2 ees'4 | % m. 10
  a4 c'4 ees'4 | % m. 11
  ees'4 c'4 d'4 | % m. 12
  \barNumberCheck #13  % Counterexposition
  d'4 c'8 bes8 a4 | % m. 13
  bes4 a4 f'4 | % m. 14
  c'2 a8 e8 | % m. 15
  a4 g4 e4 | % m. 16
  bes2 f4 | % m. 17
  g2 d''4 | % m. 18
  d'2 a4 | % m. 19
  b2 fis''4 | % m. 20
  d''2 b'8 fis'8 | % m. 21
  b'4 a'4 fis'4 | % m. 22
  d'4 c'8 bes8 a4 | % m. 23
  bes4 a4 d'4 | % m. 24
  \barNumberCheck #25  % Episode II
  d'2 c'4 | % m. 25
  a'4 bes'4 b'4 | % m. 26
  a2 cis'4 | % m. 27
  bes'2 fis'4 | % m. 28
  ees'4 d'8 c'8 b4 | % m. 29
  b2 ees'4 | % m. 30
  \barNumberCheck #31  % Development I
  d'2 a'4 | % m. 31
  g'2 cis4 | % m. 32
  ees'4 d'8 c'8 b4 | % m. 33
  a'2 fis''4 | % m. 34
  g'4 f'4 ees'4 | % m. 35
  d'2 f'4 | % m. 36
  cis4 g'2 | % m. 37
  a'4 d'2 | % m. 38
  f'4 e'4 d'4 | % m. 39
  d'4 c'8 bes8 a4 | % m. 40
  g'2 e'4 | % m. 41
  d'4 e'4 fis'4 | % m. 42
  \barNumberCheck #43  % Episode III
  ees'4 d'4 d'4 | % m. 43
  c''2 g'4 | % m. 44
  f'2 e'4 | % m. 45
  cis'2 a'4 | % m. 46
  fis'2. | % m. 47
  cis'2 a'4 | % m. 48
  \barNumberCheck #49  % Stretto / Canon
  bes4 a8 g8 fis4 | % m. 49
  a2 fis'4 | % m. 50
  g'2 d'4 | % m. 51
  d'2 a'4 | % m. 52
  g2 d4 | % m. 53
  e2 b'4 | % m. 54
  fis'2 a'4 | % m. 55
  r4 g'4 d'8 e'8~ | % m. 56
  e'8 b''8 a'4 g'4 | % m. 57
  r4 a'2 | % m. 58
  e'4 b4 a4 | % m. 59
  g'2 fis'4 | % m. 60
  \barNumberCheck #61  % Episode IV
  fis'2. | % m. 61
  bes'2 g'4 | % m. 62
  ees'2 g'4 | % m. 63
  c''2 ees'4 | % m. 64
  cis'2. | % m. 65
  a'2 fis'4 | % m. 66
  \barNumberCheck #67  % Synthetic Development
  d'2 c'4 | % m. 67
  bes4 a8 g8 fis4 | % m. 68
  g4 fis4 d'4 | % m. 69
  fis'2 a'4 | % m. 70
  d'2 b8 fis8 | % m. 71
  b4 a4 fis4 | % m. 72
  bes4 a8 g8 fis4 | % m. 73
  g4 fis4 d'4 | % m. 74
  d''2 b'8 fis'8 | % m. 75
  b'4 a'4 fis'4 | % m. 76
  fis'4 e'8 d'8 cis'4 | % m. 77
  d'4 cis'4 fis'4 | % m. 78
  \barNumberCheck #79  % Dominant Accumulation
  c''4 bes'4 a'4 | % m. 79
  d'2 c'4 | % m. 80
  fis'4 g'4 a'4 | % m. 81
  bes'4 a'4 g'4 | % m. 82
  c''2 a'4 | % m. 83
  g'4 fis'4 e'4 | % m. 84
  a'2 g'4 | % m. 85
  c''4 b'4 a'4 | % m. 86
  r4 g'2 | % m. 87
  d'4 a4 c'4 | % m. 88
  ees''2 cis''4 | % m. 89
  c''2 fis'4 | % m. 90
  \barNumberCheck #91  % Final Subject
  d''2 b'8 fis'8 | % m. 91
  b'4 a'4 fis'4 | % m. 92
  \barNumberCheck #93  % Coda
  bes'4 a'4 g'4 | % m. 93
  g'2 d'4 | % m. 94
  f'4 g'4 bes'4 | % m. 95
  ees'4 f'4 g'4 | % m. 96
  d''2 g'4 | % m. 97
  d''4 c''4 fis'4 | % m. 98
  d'2. | % m. 99
}

celloMusic = {
  \key g \minor
  \time 3/4
  \clef bass
  r2. | % m. 1
  r2. | % m. 2
  r2. | % m. 3
  r2. | % m. 4
  g,2 d,4 | % m. 5
  e,2 b4 | % m. 6
  \barNumberCheck #7  % Episode I
  g,2 a,4 | % m. 7
  bes,2 c4 | % m. 8
  d2 c4 | % m. 9
  bes,2 a,4 | % m. 10
  f,2 c4 | % m. 11
  f,2 bes,4 | % m. 12
  \barNumberCheck #13  % Counterexposition
  f2 d8 a,8 | % m. 13
  d4 c4 a,4 | % m. 14
  a,4 g,8 f,8 e,4 | % m. 15
  f,4 e,4 c4 | % m. 16
  f2 d8 a,8 | % m. 17
  d4 c4 a,4 | % m. 18
  fis,4 e,8 d,8 cis,4 | % m. 19
  d,4 cis,4 a,4 | % m. 20
  g,2 d,4 | % m. 21
  e,2 b4 | % m. 22
  bes,2 f,4 | % m. 23
  g2 bes,4 | % m. 24
  \barNumberCheck #25  % Episode II
  bes,2 a,4 | % m. 25
  f,2 g,4 | % m. 26
  d4 c8 bes,8 a,4 | % m. 27
  ees2 d4 | % m. 28
  g,2 b,4 | % m. 29
  g,2 c4 | % m. 30
  \barNumberCheck #31  % Development I
  c2.~ | % m. 31
  c4 g,2 | % m. 32
  a,2.~ | % m. 33
  a,4 e'2 | % m. 34
  ees2 bes,4 | % m. 35
  bes,2 ees4 | % m. 36
  c2 bes,4 | % m. 37
  a,2 d4 | % m. 38
  d2. | % m. 39
  g,2 d4 | % m. 40
  a,2 cis4 | % m. 41
  a,2 d4 | % m. 42
  \barNumberCheck #43  % Episode III
  c2 b,4 | % m. 43
  aes,2 c4 | % m. 44
  d2 a,4 | % m. 45
  a,2 d4 | % m. 46
  d2 c4 | % m. 47
  a,2 d4 | % m. 48
  \barNumberCheck #49  % Stretto / Canon
  g,2 d,4 | % m. 49
  e,2 b4 | % m. 50
  c2 a,4 | % m. 51
  a,2 d4 | % m. 52
  g,2 d4 | % m. 53
  ees2 d4 | % m. 54
  d2. | % m. 55
  r2 g,4 | % m. 56
  d,8 e,4 b8 c4 | % m. 57
  d2. | % m. 58
  r4 d2 | % m. 59
  d2. | % m. 60
  \barNumberCheck #61  % Episode IV
  d2. | % m. 61
  ees2. | % m. 62
  c2. | % m. 63
  aes,2. | % m. 64
  a,2. | % m. 65
  d2. | % m. 66
  \barNumberCheck #67  % Synthetic Development
  bes,4 a,8 g,8 fis,4 | % m. 67
  g,4 fis,4 d4 | % m. 68
  ees2 d4 | % m. 69
  d2. | % m. 70
  c2 g,4 | % m. 71
  ees2 d4 | % m. 72
  g,2 d4 | % m. 73
  d2. | % m. 74
  g,2 d,4 | % m. 75
  e,2 b4 | % m. 76
  d2 a,4 | % m. 77
  b,2 d4 | % m. 78
  \barNumberCheck #79  % Dominant Accumulation
  d2. | % m. 79
  d2. | % m. 80
  d2. | % m. 81
  d2. | % m. 82
  d2. | % m. 83
  d2. | % m. 84
  d2. | % m. 85
  d2. | % m. 86
  d2. | % m. 87
  d2. | % m. 88
  d2. | % m. 89
  d2. | % m. 90
  \barNumberCheck #91  % Final Subject
  g,2 d,4 | % m. 91
  e,2 b4 | % m. 92
  \barNumberCheck #93  % Coda
  g,2. | % m. 93
  g,2. | % m. 94
  g,2. | % m. 95
  g,2. | % m. 96
  g,2 d4 | % m. 97
  d2. | % m. 98
  g,2. | % m. 99
}

\score {
  \new StaffGroup <<
    \new Staff \with {
      instrumentName = "Violin"
      shortInstrumentName = "Vln."
      midiInstrument = "acoustic grand"
    } { \violinMusic }
    \new Staff \with {
      instrumentName = "Viola"
      shortInstrumentName = "Vla."
      midiInstrument = "acoustic grand"
    } { \violaMusic }
    \new Staff \with {
      instrumentName = "Violoncello"
      shortInstrumentName = "Vc."
      midiInstrument = "acoustic grand"
    } { \celloMusic }
  >>
  \layout { }
  \midi { }
}
