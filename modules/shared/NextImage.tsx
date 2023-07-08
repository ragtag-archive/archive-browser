import Image from 'next/image';
import { ENABLE_IMAGE_OPTIMIZATION } from './config';

type NextImageProps = React.ComponentPropsWithoutRef<typeof Image>;

export const NextImage = (props: NextImageProps) => (
  <Image unoptimized={!ENABLE_IMAGE_OPTIMIZATION} {...props} />
);
