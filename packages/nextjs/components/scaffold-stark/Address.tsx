"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Address as AddressType } from "@starknet-react/chains";
import { getChecksumAddress, validateChecksumAddress } from "starknet";
import { devnet } from "@starknet-react/chains";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-stark";
import { BlockieAvatar } from "~~/components/scaffold-stark/BlockieAvatar";
import { getStarknetPFPIfExists } from "~~/utils/profile";
import useConditionalStarkProfile from "~~/hooks/useConditionalStarkProfile";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

export const Address = ({
  address,
  disableAddressLink,
  format,
  size = "base",
}: AddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);

  const { targetNetwork } = useTargetNetwork();
  const { data: profile } = useConditionalStarkProfile(address);

  const checkSumAddress = useMemo(() => {
    if (!address) return undefined;
    return getChecksumAddress(address);
  }, [address]);

  if (!checkSumAddress) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!validateChecksumAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(
    targetNetwork,
    checkSumAddress
  );

  let displayAddress =
    checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);

  if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = checkSumAddress;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(checkSumAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 800);
  };

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {getStarknetPFPIfExists(profile?.profilePicture) ? (
          <img
            src={profile?.profilePicture}
            alt="Profile Picture"
            className="rounded-full h-6 w-6"
            width={24}
            height={24}
          />
        ) : (
          <BlockieAvatar
            address={checkSumAddress}
            ensImage={ensAvatar}
            size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
          />
        )}
      </div>
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          {profile?.name || displayAddress}
        </span>
      ) : targetNetwork.network === devnet.network ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          <Link href={blockExplorerAddressLink}>
            {profile?.name || displayAddress}
          </Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {profile?.name || displayAddress}
        </a>
      )}
      {addressCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5"
          aria-hidden="true"
        />
      ) : (
        <button
          onClick={handleCopy}
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-label="Copy Address"
        >
          <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
