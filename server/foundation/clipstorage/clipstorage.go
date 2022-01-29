package clipstorage

import (
	"fmt"
	"io"
	"log"
	"os"
)


func Save(clipId string, data io.ReadCloser) (error) {
	dst, err := os.Create(clipId + ".mp4")
	if err != nil {
		return err
	}
	defer dst.Close()

	w, err := io.Copy(dst, data)
	if err != nil {
		return err
	}
	log.Println(fmt.Sprintf("stored clip with %d bytes", w))

	return nil
}

func Delete(clipId string) (error) {
	return os.Remove(clipId + ".mp4")
}
