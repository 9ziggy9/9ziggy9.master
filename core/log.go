package core

import (
	"runtime"
	"fmt"
	"log"
)

type LogLevel int

const (
	INFO LogLevel = iota
	SUCCESS
	WARNING
	ERROR
)

var LogLevelStrMap = map[LogLevel]string{
	INFO:    "INFO",
	SUCCESS: "SUCCESS",
	WARNING: "WARNING",
	ERROR:   "ERROR",
}

func extractRuntimeMetaData(skip int) (string, string, int) {
	pc, file, line, ok := runtime.Caller(skip)
	if !ok {
		panic("FATAL RUNTIME EXTRACTION ERROR")
	}
	fn := runtime.FuncForPC(pc).Name()
	return fn, file, line
}

type textColors struct {
	Reset   string
	Red     string
	Green   string
	Yellow  string
	Blue    string
	Magenta string
	Cyan    string
	Gray    string
	White   string
}

var TEXT_COLORS = textColors{
	Reset:   "\033[0m",
	Red:     "\033[31m",
	Green:   "\033[32m",
	Yellow:  "\033[33m",
	Blue:    "\033[34m",
	Magenta: "\033[35m",
	Cyan:    "\033[36m",
	Gray:    "\033[37m",
	White:   "\033[97m",
}

func ColorizeText(txt string, clr string) string {
	return clr + txt + TEXT_COLORS.Reset
}

const logFmtInfo string = "\n  -> [%s] %s\n"
const logFmtErr string = "\n  -> [%s] %s (@ %s :: %d)\n\n"

func Log(lvl LogLevel, msg string, optargs ...interface{}) {
	fmt.Printf("\n")
	skip := 2 // Skip `Log` and `extractRuntimeMetaData` function calls
	switch lvl {
	case INFO:
		log.Printf(
			logFmtInfo,
			ColorizeText(LogLevelStrMap[lvl], TEXT_COLORS.Yellow),
			ColorizeText(fmt.Sprintf(msg, optargs...), TEXT_COLORS.Cyan),
		)
	case SUCCESS:
		log.Printf(
			logFmtInfo,
			ColorizeText(LogLevelStrMap[lvl], TEXT_COLORS.Green),
			ColorizeText(fmt.Sprintf(msg, optargs...), TEXT_COLORS.Cyan),
		)
	case ERROR:
		fn, _, line := extractRuntimeMetaData(skip)
		log.Printf(
			logFmtErr,
			ColorizeText(LogLevelStrMap[lvl], TEXT_COLORS.Red),
			ColorizeText(fmt.Sprintf(msg, optargs...), TEXT_COLORS.Cyan),
			fn, line,
		)
	}
}
